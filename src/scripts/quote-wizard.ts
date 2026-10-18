interface QuoteOption {
  value: string;
  label: string;
}

interface QuoteConfig {
  'project-types': QuoteOption[];
  platforms: QuoteOption[];
  'native-targets': QuoteOption[];
  scopes: QuoteOption[];
  features: QuoteOption[];
  'design-options': QuoteOption[];
  'remove-feature-label': string;
}

function initQuoteWizard(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('form.quote__form');
  const configurationText = root.dataset.config;
  const whatsappNumber = root.dataset.whatsapp;
  if (!form || !configurationText || !whatsappNumber) {
    throw new Error('Solicitud: faltan el formulario, la configuración o el número de WhatsApp.');
  }

  const config: QuoteConfig = JSON.parse(configurationText);
  if (!/^\d{11,15}$/.test(whatsappNumber)) {
    throw new Error('Solicitud: configura el número de WhatsApp con código de país y solo dígitos.');
  }

  const steps = Array.from(form.querySelectorAll<HTMLElement>('[data-wizard-step]'));
  const progressItems = Array.from(form.querySelectorAll<HTMLElement>('[data-progress-item]'));
  const errorMessage = form.querySelector<HTMLElement>('[data-wizard-error]');
  const nextButton = form.querySelector<HTMLButtonElement>('[data-action="next"]');
  const reviewButton = form.querySelector<HTMLButtonElement>('[data-action="review"]');
  const backButton = form.querySelector<HTMLButtonElement>('[data-action="back"]');
  const restartButton = form.querySelector<HTMLButtonElement>('[data-action="restart"]');
  const requestSummary = form.querySelector<HTMLElement>('[data-request-summary]');
  const sendLink = form.querySelector<HTMLAnchorElement>('[data-send-request]');
  const projectInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="projectType"]'));
  const platformGroup = form.querySelector<HTMLElement>('[data-platform-group]');
  const nativeTargetGroup = form.querySelector<HTMLElement>('[data-native-target-group]');
  const nativeInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="platform"]'));
  const nativeTargetInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="nativeTarget"]'));
  const customFeatureInput = form.querySelector<HTMLInputElement>('[data-custom-feature-input]');
  const addFeatureButton = form.querySelector<HTMLButtonElement>('[data-action="add-feature"]');
  const customFeatureList = form.querySelector<HTMLUListElement>('[data-custom-feature-list]');
  const customFeatures: string[] = [];
  let activeStep = 0;

  if (!errorMessage || !nextButton || !reviewButton || !backButton || !restartButton ||
      !requestSummary || !sendLink || steps.length !== 4 || progressItems.length !== steps.length ||
      projectInputs.length !== config['project-types'].length || !platformGroup || !nativeTargetGroup ||
      nativeInputs.length !== config.platforms.length || nativeTargetInputs.length !== config['native-targets'].length ||
      !customFeatureInput || !addFeatureButton || !customFeatureList) {
    throw new Error('Solicitud: el formulario no contiene todos los campos y controles esperados.');
  }

  const setStep = (step: number): void => {
    if (step < 0 || step >= steps.length) throw new Error(`Solicitud: paso inválido (${step}).`);
    activeStep = step;
    steps.forEach((element, index) => { element.hidden = index !== step; });
    progressItems.forEach((element, index) => {
      element.classList.toggle('is-active', index === step);
      element.classList.toggle('is-complete', index < step);
      if (index === step) element.setAttribute('aria-current', 'step');
      else element.removeAttribute('aria-current');
    });
    backButton.hidden = step === 0 || step === steps.length - 1;
    nextButton.hidden = step >= 2;
    reviewButton.hidden = step !== 2;
    restartButton.hidden = step !== steps.length - 1;
    errorMessage.hidden = true;
    const heading = steps[step].querySelector<HTMLElement>('legend, h3');
    heading?.focus();
  };

  const updateSelectionStyles = (): void => {
    form.querySelectorAll<HTMLInputElement>('.quote__option input').forEach((input) => {
      input.closest('.quote__option')?.classList.toggle('is-selected', input.checked);
    });
  };

  const updateProjectType = (): void => {
    const selectedType = projectInputs.find((input) => input.checked)?.value;
    const isMobile = selectedType === 'mobile';
    platformGroup.hidden = !isMobile;
    nativeInputs.forEach((input) => {
      input.required = isMobile;
      if (!isMobile) input.checked = input.value === 'multiplatform';
    });
    updateNativeTargets();
    updateSelectionStyles();
  };

  const updateNativeTargets = (): void => {
    const isNativeApp = projectInputs.some((input) => input.checked && input.value === 'mobile') &&
      nativeInputs.some((input) => input.checked && input.value === 'native');
    nativeTargetGroup.hidden = !isNativeApp;
    nativeTargetInputs.forEach((input) => {
      input.required = isNativeApp;
      if (!isNativeApp) input.checked = false;
    });
  };

  const showValidationError = (message: string, invalidInput?: HTMLElement): void => {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    invalidInput?.focus();
  };

  const renderCustomFeatures = (): void => {
    customFeatureList.replaceChildren();
    customFeatures.forEach((feature, index) => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      const removeButton = document.createElement('button');
      label.textContent = feature;
      removeButton.type = 'button';
      removeButton.textContent = config['remove-feature-label'];
      removeButton.setAttribute('aria-label', `${config['remove-feature-label']}: ${feature}`);
      removeButton.addEventListener('click', () => {
        customFeatures.splice(index, 1);
        renderCustomFeatures();
      });
      item.append(label, removeButton);
      customFeatureList.append(item);
    });
  };

  const addCustomFeature = (): void => {
    const feature = customFeatureInput.value.trim();
    if (!feature) {
      showValidationError('Escribe la funcionalidad que quieres agregar.', customFeatureInput);
      return;
    }
    if (customFeatures.length >= 10) {
      showValidationError('Puedes agregar hasta 10 funcionalidades adicionales.');
      return;
    }
    if (customFeatures.some((item) => item.toLocaleLowerCase() === feature.toLocaleLowerCase())) {
      showValidationError('Esa funcionalidad ya está en tu lista.');
      return;
    }
    customFeatures.push(feature);
    customFeatureInput.value = '';
    errorMessage.hidden = true;
    renderCustomFeatures();
    customFeatureInput.focus();
  };

  const optionLabel = (options: QuoteOption[], value: string | null): string =>
    options.find((option) => option.value === value)?.label ?? 'Por definir';

  const createSummaryLine = (label: string, value: string): void => {
    const paragraph = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    paragraph.append(strong, document.createTextNode(value));
    requestSummary.append(paragraph);
  };

  const prepareRequest = (): void => {
    const data = new FormData(form);
    const projectType = String(data.get('projectType') ?? '');
    const platform = String(data.get('platform') ?? '');
    const nativeTarget = String(data.get('nativeTarget') ?? '');
    const scope = String(data.get('scope') ?? '');
    const design = String(data.get('design') ?? '');
    const description = String(data.get('appDescription') ?? '').trim();
    if (!description) {
      setStep(2);
      showValidationError('Describe la aplicación que quieres crear para continuar.',
        form.querySelector<HTMLTextAreaElement>('textarea[name="appDescription"]') ?? undefined);
      return;
    }

    const selectedFeatures = data.getAll('features')
      .map(String)
      .map((value) => optionLabel(config.features, value));
    const projectLabel = optionLabel(config['project-types'], projectType);
    const platformLabel = projectType === 'mobile'
      ? platform === 'native'
        ? `${optionLabel(config.platforms, platform)} — ${optionLabel(config['native-targets'], nativeTarget)}`
        : optionLabel(config.platforms, platform)
      : 'No aplica';
    const scopeLabel = optionLabel(config.scopes, scope);
    const designLabel = optionLabel(config['design-options'], design);
    const name = String(data.get('name') ?? '').trim() || 'No indicado';
    const functionalityLabel = selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'Ninguna seleccionada';
    const customFunctionalityLabel = customFeatures.length > 0
      ? customFeatures.join(', ')
      : 'Ninguna agregada';

    requestSummary.replaceChildren();
    createSummaryLine('Tipo de proyecto', projectLabel);
    createSummaryLine('Plataforma', platformLabel);
    createSummaryLine('Alcance', scopeLabel);
    createSummaryLine('Diseño', designLabel);
    createSummaryLine('Funciones generales', functionalityLabel);
    createSummaryLine('Funciones específicas', customFunctionalityLabel);
    createSummaryLine('Descripción de la aplicación', description);
    createSummaryLine('Nombre', name);

    const message = [
      'Hola, quiero conversar sobre mi proyecto con Eddy Software.',
      '',
      `Tipo de proyecto: ${projectLabel}`,
      `Plataforma: ${platformLabel}`,
      `Alcance: ${scopeLabel}`,
      `Diseño: ${designLabel}`,
      `Funciones generales: ${functionalityLabel}`,
      `Funciones específicas: ${customFunctionalityLabel}`,
      `Descripción de la aplicación: ${description}`,
      `Nombre: ${name}`,
    ].join('\n');
    sendLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    setStep(steps.length - 1);
  };

  projectInputs.forEach((input) => {
    input.addEventListener('change', updateProjectType);
  });
  form.querySelectorAll<HTMLInputElement>('.quote__option input:not([name="projectType"])')
    .forEach((input) => input.addEventListener('change', () => {
      updateSelectionStyles();
      if (input.name === 'platform') updateNativeTargets();
    }));
  addFeatureButton.addEventListener('click', addCustomFeature);
  customFeatureInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCustomFeature();
    }
  });

  nextButton.addEventListener('click', () => {
    if (activeStep === 0 && !projectInputs.some((input) => input.checked)) {
      showValidationError('Selecciona qué tipo de proyecto quieres construir.');
      return;
    }
    if (activeStep === 0 && projectInputs.find((input) => input.checked)?.value === 'mobile' &&
        !nativeInputs.some((input) => input.checked)) {
      showValidationError('Selecciona cómo quieres desarrollar la app.');
      return;
    }
    if (activeStep === 0 && projectInputs.find((input) => input.checked)?.value === 'mobile' &&
        nativeInputs.some((input) => input.checked && input.value === 'native') &&
        !nativeTargetInputs.some((input) => input.checked)) {
      showValidationError('Selecciona si las apps nativas serán para Android, iPhone o ambas plataformas.');
      return;
    }
    if (activeStep === 1 && !form.querySelector<HTMLInputElement>('input[name="scope"]:checked')) {
      showValidationError('Selecciona el alcance inicial del proyecto.');
      return;
    }
    setStep(activeStep + 1);
  });
  reviewButton.addEventListener('click', prepareRequest);
  backButton.addEventListener('click', () => setStep(activeStep - 1));
  restartButton.addEventListener('click', () => {
    form.reset();
    customFeatures.length = 0;
    renderCustomFeatures();
    requestSummary.replaceChildren();
    updateProjectType();
    setStep(0);
  });

  updateProjectType();
  setStep(0);
}

document.querySelectorAll<HTMLElement>('[data-quote-wizard]').forEach(initQuoteWizard);
