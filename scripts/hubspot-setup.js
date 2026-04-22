#!/usr/bin/env node
/**
 * HubSpot setup for AgentesVA
 *
 * Creates:
 *  - 6 custom contact properties
 *  - 1 marketing form "Diagnóstico AgentesVA" with 7 fields
 *
 * Usage:
 *   HUBSPOT_TOKEN=pat-xxx HUBSPOT_PORTAL_ID=12345678 node scripts/hubspot-setup.js
 *
 * Requires scopes on the Private App:
 *   - forms
 *   - crm.schemas.contacts.write
 *   - crm.objects.contacts.write
 */

const TOKEN = process.env.HUBSPOT_TOKEN;
const PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;

if (!TOKEN || !PORTAL_ID) {
  console.error('Missing HUBSPOT_TOKEN or HUBSPOT_PORTAL_ID env vars.');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

/* ------------------------------------------------------------------ */
/* 1. CUSTOM CONTACT PROPERTIES                                       */
/* ------------------------------------------------------------------ */

const properties = [
  {
    name: 'industria_agentesva',
    label: 'Industria (AgentesVA)',
    type: 'enumeration',
    fieldType: 'select',
    groupName: 'contactinformation',
    description: 'Industria del lead capturada en el diagnóstico AgentesVA',
    options: [
      { label: 'Consultorio / Clínica', value: 'consultorio' },
      { label: 'Restaurante', value: 'restaurante' },
      { label: 'Ecommerce', value: 'ecommerce' },
      { label: 'Inmobiliaria', value: 'inmobiliaria' },
      { label: 'Salón / Estética', value: 'salon' },
      { label: 'Gimnasio', value: 'gimnasio' },
      { label: 'Agencia', value: 'agencia' },
      { label: 'Academia / Escuela', value: 'academia' },
      { label: 'Consultoría', value: 'consultoria' },
      { label: 'Farmacia', value: 'farmacia' },
      { label: 'Coaching', value: 'coach' },
      { label: 'Otro', value: 'otro' }
    ].map((o, i) => ({ ...o, displayOrder: i }))
  },
  {
    name: 'tamano_equipo',
    label: 'Tamaño del equipo',
    type: 'enumeration',
    fieldType: 'radio',
    groupName: 'contactinformation',
    options: [
      { label: 'Solo yo', value: 'solo_yo' },
      { label: '2-5 personas', value: '2_5' },
      { label: '6-20 personas', value: '6_20' },
      { label: '20+ personas', value: '20_plus' }
    ].map((o, i) => ({ ...o, displayOrder: i }))
  },
  {
    name: 'herramientas_actuales',
    label: 'Herramientas actuales',
    type: 'enumeration',
    fieldType: 'checkbox',
    groupName: 'contactinformation',
    options: [
      { label: 'Gmail / Outlook', value: 'email' },
      { label: 'WhatsApp', value: 'whatsapp' },
      { label: 'Excel / Sheets', value: 'sheets' },
      { label: 'CRM existente', value: 'crm' },
      { label: 'Calendly o similar', value: 'calendly' },
      { label: 'Otras', value: 'otras' }
    ].map((o, i) => ({ ...o, displayOrder: i }))
  },
  {
    name: 'dolor_principal',
    label: 'Dolor principal (texto libre)',
    type: 'string',
    fieldType: 'textarea',
    groupName: 'contactinformation',
    description: 'Respuesta textual del lead sobre su mayor frustración operativa'
  },
  {
    name: 'presupuesto_rango',
    label: 'Presupuesto estimado',
    type: 'enumeration',
    fieldType: 'radio',
    groupName: 'contactinformation',
    options: [
      { label: '<500€', value: 'lt_500' },
      { label: '500-1.500€', value: '500_1500' },
      { label: '1.500-5.000€', value: '1500_5000' },
      { label: '5.000€+', value: 'gt_5000' },
      { label: 'No lo sé todavía', value: 'unknown' }
    ].map((o, i) => ({ ...o, displayOrder: i }))
  },
  {
    name: 'lead_score_agentesva',
    label: 'Lead score AgentesVA',
    type: 'number',
    fieldType: 'number',
    groupName: 'contactinformation',
    description: 'Score 1-10 calculado por workflow según respuestas del diagnóstico'
  }
];

async function createProperty(prop) {
  const res = await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify(prop)
  });
  if (res.status === 409) {
    console.log(`   (already exists: ${prop.name})`);
    return true;
  }
  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Failed to create property ${prop.name}: ${res.status}`);
    console.error(`   ${err.slice(0, 300)}`);
    return false;
  }
  console.log(`✅ Created property: ${prop.name}`);
  return true;
}

/* ------------------------------------------------------------------ */
/* 2. MARKETING FORM                                                  */
/* ------------------------------------------------------------------ */

const now = new Date().toISOString();
const form = {
  name: 'Diagnóstico AgentesVA',
  formType: 'hubspot',
  createdAt: now,
  updatedAt: now,
  archived: false,
  fieldGroups: [
    {
      groupType: 'default_group',
      richTextType: 'text',
      fields: [
        { objectTypeId: '0-1', name: 'firstname', label: '¿Cuál es tu nombre?', required: true, hidden: false, fieldType: 'single_line_text', validation: { useDefaultBlockList: false, blockedEmailAddresses: [] } },
        { objectTypeId: '0-1', name: 'email', label: '¿A qué email te enviamos el diagnóstico?', required: true, hidden: false, fieldType: 'email', validation: { useDefaultBlockList: false, blockedEmailAddresses: [] } },
        { objectTypeId: '0-1', name: 'industria_agentesva', label: '¿A qué se dedica tu negocio?', required: true, hidden: false, fieldType: 'dropdown', validation: { useDefaultBlockList: false, blockedEmailAddresses: [] } }
      ]
    },
    {
      groupType: 'default_group',
      richTextType: 'text',
      fields: [
        { objectTypeId: '0-1', name: 'tamano_equipo', label: '¿Cuántas personas en tu equipo?', required: true, hidden: false, fieldType: 'radio', validation: { useDefaultBlockList: false, blockedEmailAddresses: [] } },
        { objectTypeId: '0-1', name: 'herramientas_actuales', label: '¿Qué herramientas usas hoy?', required: false, hidden: false, fieldType: 'multiple_checkboxes', validation: { useDefaultBlockList: false, blockedEmailAddresses: [] } },
        { objectTypeId: '0-1', name: 'dolor_principal', label: 'En 2 líneas, ¿cuál es tu mayor frustración operativa?', required: true, hidden: false, fieldType: 'multi_line_text', validation: { useDefaultBlockList: false, blockedEmailAddresses: [] } }
      ]
    },
    {
      groupType: 'default_group',
      richTextType: 'text',
      fields: [
        { objectTypeId: '0-1', name: 'presupuesto_rango', label: 'Para resolver este dolor, ¿qué inversión contemplas?', required: true, hidden: false, fieldType: 'radio', validation: { useDefaultBlockList: false, blockedEmailAddresses: [] } }
      ]
    }
  ],
  configuration: {
    language: 'es',
    cloneable: true,
    postSubmitAction: {
      type: 'thank_you',
      value: '¡Gracias! En los próximos 2 minutos recibirás tu diagnóstico personalizado en tu email. Revisa también la carpeta de spam.'
    },
    editable: true,
    archivable: true,
    recaptchaEnabled: false,
    notifyContactOwner: false,
    notifyRecipients: [],
    createNewContactForNewEmail: true,
    prePopulateKnownValues: true,
    allowLinkToResetKnownValues: false,
    lifecycleStages: []
  },
  displayOptions: {
    renderRawHtml: false,
    theme: 'default_style',
    submitButtonText: 'Recibir mi diagnóstico',
    style: {
      fontFamily: 'Inter, sans-serif',
      backgroundWidth: 'rgba(0,0,0,0)',
      labelTextColor: '#151a33',
      helpTextColor: '#676c82',
      legalConsentTextColor: '#676c82',
      submitColor: '#1e47f1',
      submitAlignment: 'center',
      submitFontColor: '#ffffff'
    },
    cssClass: 'agentesva-diagnostic-form'
  },
  legalConsentOptions: {
    type: 'none'
  }
};

async function createForm() {
  const res = await fetch('https://api.hubapi.com/marketing/v3/forms/', {
    method: 'POST',
    headers,
    body: JSON.stringify(form)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Failed to create form: ${res.status}`);
    console.error(`   ${err.slice(0, 500)}`);
    return null;
  }
  const data = await res.json();
  console.log(`✅ Created form: ${form.name}`);
  console.log(`   Form GUID: ${data.id}`);
  return data;
}

/* ------------------------------------------------------------------ */
/* 3. EXECUTE                                                         */
/* ------------------------------------------------------------------ */

(async () => {
  console.log('\n🔧 HubSpot setup for AgentesVA\n');
  console.log(`Portal ID: ${PORTAL_ID}\n`);

  console.log('📋 Creating custom contact properties...\n');
  for (const p of properties) {
    await createProperty(p);
  }

  console.log('\n📋 Creating marketing form...\n');
  const formData = await createForm();

  if (formData) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Setup complete.\n');
    console.log(`Portal ID:  ${PORTAL_ID}`);
    console.log(`Form GUID:  ${formData.id}`);
    console.log(`Submit URL: https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${formData.id}`);
    console.log('\nNext steps:');
    console.log('  1. Integrate the submit URL into /diagnostico/ quiz submit handler');
    console.log('  2. Configure workflow in HubSpot UI (lead scoring + auto-email)');
    console.log('  3. Rotate the Private App token for security');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
})();
