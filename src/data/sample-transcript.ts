export const sampleTranscript = `Meeting Title: Internal Planning Session for Retail Inventory Assistant

Participants:
- Sarah (Product Manager)
- Daniel (Operations Lead)
- Nia (Store Manager)
- Ravi (Engineering Lead)

Transcript:
Sarah: We want to reduce the amount of time store teams spend checking stock manually across the warehouse and the front shelves.

Daniel: Right now staff often walk to the backroom, check a spreadsheet, and then come back to the floor. It is slow and the data is not always updated.

Nia: From the store side, the pain is biggest during peak hours. A customer asks if an item is available, and our staff cannot answer confidently in under a minute.

Sarah: The first version should help staff search product availability quickly, view current quantity, and see whether an item is on the shelf or in the backroom.

Ravi: We can support mobile web first. That is faster for us than native apps. We should keep authentication simple, maybe staff login with store credentials.

Daniel: We also need low stock alerts for supervisors so they can restock before customers complain.

Nia: I would also like a simple restock task list. If the shelf quantity drops under a threshold, the floor team should know which items to refill.

Sarah: Good. So main users are floor staff and supervisors. Floor staff need fast search and stock location. Supervisors need alerts and visibility across tasks.

Ravi: Non-functional requirement wise, search needs to feel fast. If it takes more than a couple seconds, staff will not use it. The UI also has to work well on tablets and phones.

Daniel: For success metrics, we should reduce stock-check response time and improve shelf availability.

Sarah: Let us keep the first release focused. Search inventory, view stock location, low stock alerts, and a restock task list are enough for version one.`;
