export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQS: FaqItem[] = [
  {
    question: 'What types of junk do you remove?',
    answer:
      'We take almost everything! This includes old furniture, mattresses, appliances, white goods, green waste, renovation debris, e-waste, office equipment, and general household rubbish. We cannot take hazardous materials like asbestos, chemicals, or wet paint.',
  },
  {
    question: 'Do you offer same-day service?',
    answer:
      "Yes! We offer same-day and next-day rubbish removal services across Melbourne. It's best to call us early in the day to secure a spot, but we'll always do our best to accommodate urgent requests.",
  },
  {
    question: 'How do you charge for rubbish removal?',
    answer:
      'We charge based on volume (cubic metres) - you only pay for the exact space your junk takes up in our truck. Our pricing includes two strong team members, all heavy lifting, loading, and disposal fees. No hidden costs or surprise dump fees.',
  },
  {
    question: 'Do I need to put the rubbish on the nature strip?',
    answer:
      'Not at all. We provide a full hands-off service. Whether your junk is in the backyard, upstairs, in the garage, or under the house, our team will go in and get it. We even sweep up the area afterwards.',
  },
  {
    question: 'What happens to the junk once you take it?',
    answer:
      "We are committed to eco-friendly disposal. We sort the load in our trucks to ensure recyclable materials (metals, e-waste, timber) go to recycling centres, and items in good condition are donated. Only what truly can't be salvaged goes to landfill.",
  },
];
