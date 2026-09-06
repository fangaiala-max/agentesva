# AgentesVA — interactive demo handover

This is documentation for the working demonstration on agentesva.com. It is not a client case study or a production integration. All examples are fictional and run locally in the browser.

## Purpose
Show how a message or record moves through classification, preparation and human review. The visitor can choose customer support, sales or operations, then select a standard case or an exception.

## Inputs and boundaries
- Inputs come from predefined examples; no customer data is collected by the demo.
- The browser does not contact an AI model, CRM, messaging service or payment system.
- No message is sent, quote issued or payment approved.
- The assessment form is a separate feature and is not part of this simulation.

## Operating the demo
1. Choose an automation area.
2. Choose the standard example or its exception.
3. Select Run the demo.
4. Read the result and the human-review instruction.
5. Expand the workflow steps to inspect the sequence. Reset restores the ready state.

## Exception handling and ownership
Each area includes an exception example. The result identifies what needs review rather than pretending that an uncertain request was completed. A person retains responsibility for the final customer response or business decision.

## Acceptance checks
- All three areas support both example types.
- Changing the area or example resets the previous run.
- Run, replay and reset remain available by keyboard.
- Reduced-motion preference produces the completed example without step animation.
- Navigating away cleans up the animation sequence.
- English and Spanish versions use the same intended behavior with localized copy.

## Production handover requirements
A real implementation would additionally document approved systems, credential ownership, data retention, failure alerts, retry policy, escalation contacts, rollback and signed-off acceptance results. These are not configured by this demo and must be agreed for each project.
