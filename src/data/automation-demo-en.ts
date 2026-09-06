export type DemoMode = 'attention' | 'sales' | 'operations';
export type DemoExample = 'standard' | 'exception';
export const DEMO_MODES = {
  attention: {
    label: 'Support', icon: '↗', title: 'One question. One clear next step.',
    description: 'Organize messages, prepare a response, and leave the decision with your team.',
    href: '/services/customer-support/', service: 'customer_service_automation', cluster: 'customer_service',
    steps: ['Message received', 'Classification', 'Response drafted', 'Human review'],
    examples: {
      standard: { label: 'Order status question', inputLabel: 'Sample message', input: 'Hi, when will my order AV-2048 arrive? I need it by Friday.', reference: 'AV-2048', category: 'Order status', result: 'Order AV-2048 is being prepared in this example. A response is drafted so the team can confirm the delivery date before sending it.', fields: [['Reference', 'AV-2048'], ['Question type', 'Order status'], ['Owner', 'Support team']], status: 'Draft ready for review', handoff: 'A person confirms the date and approves the message.' },
      exception: { label: 'Missing order number', inputLabel: 'Incomplete message', input: 'Hi, my order has not arrived. Could you check it?', reference: 'No reference', category: 'Incomplete information', result: 'An order number is needed to check the status. The workflow prepares a request for the missing information without inventing a delivery date.', fields: [['Reference', 'Pending'], ['Missing information', 'Order number'], ['Owner', 'Support team']], status: 'Sent for team review', handoff: 'The team requests the missing information. Nothing is sent automatically.' },
    },
  },
  sales: {
    label: 'Sales', icon: '↗', title: 'Turn interest into an organized opportunity.',
    description: 'Extract useful information, update the CRM, and prepare follow-up with context.',
    href: '/services/sales/', service: 'sales_automation', cluster: 'sales',
    steps: ['Request received', 'Data extracted', 'CRM updated', 'Follow-up prepared'],
    examples: {
      standard: { label: 'Quote request', inputLabel: 'Sample request', input: 'We are a studio of 8 people. We want to connect our forms and CRM. Our budget is €2,000 and we would like to start this month.', reference: 'OP-013', category: 'Qualified request', result: 'The opportunity is recorded in the sample CRM. A call is prepared to review scope and feasibility. No proposal has been approved.', fields: [['Team', '8 people'], ['Stated budget', '€2,000'], ['Interest', 'Forms + CRM']], status: 'Follow-up awaiting approval', handoff: 'A person reviews the fit before making contact.' },
      exception: { label: 'Scope still unclear', inputLabel: 'Incomplete request', input: 'We want to automate the whole business. How much does it cost?', reference: 'OP-014', category: 'Missing context', result: 'Questions are prepared about the process, tools, frequency, and owner. A quote is not calculated from insufficient information.', fields: [['Process', 'To be defined'], ['Budget', 'Not provided'], ['Next step', 'Scope review']], status: 'Sales review required', handoff: 'The team clarifies the scope before proposing a solution.' },
    },
  },
  operations: {
    label: 'Operations', icon: '▤', title: 'Data in place. Exceptions in view.',
    description: 'Turn a document into a validated record, with approval and an audit trail.',
    href: '/services/operations/', service: 'process_automation', cluster: 'operations',
    steps: ['Document received', 'Data extracted', 'Validation', 'Awaiting approval'],
    examples: {
      standard: { label: 'Invoice with complete data', inputLabel: 'Sample invoice', input: 'INVOICE DEMO-028\nSample supplier\nSubtotal: €100.00 · VAT: €21.00\nTotal: €121.00 · Reference: OC-028', reference: 'DEMO-028', category: 'Document validated', result: 'The amounts in the example match. The record is prepared for review, without posting it to the accounts or issuing a payment.', fields: [['Subtotal', '€100.00'], ['VAT', '€21.00'], ['Total', '€121.00']], status: 'Awaiting approval', handoff: 'A person authorizes the final record. No payment is made.' },
      exception: { label: 'Invoice with inconsistent amounts', inputLabel: 'Invoice with an exception', input: 'INVOICE DEMO-029\nSample supplier\nSubtotal: €100.00 · VAT: €21.00\nStated total: €150.00', reference: 'DEMO-029', category: 'Inconsistent amounts', result: 'The subtotal and VAT add up to €121.00, but the stated total is €150.00. The workflow stops the record and flags the difference.', fields: [['Calculated total', '€121.00'], ['Stated total', '€150.00'], ['Difference', '€29.00']], status: 'Validation stopped', handoff: 'The team reviews the original document. It is not automatically corrected or approved.' },
    },
  },
} as const;
export const DEMO_MODE_KEYS = Object.keys(DEMO_MODES) as DemoMode[];
