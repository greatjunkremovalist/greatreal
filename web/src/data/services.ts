export interface ServicePage {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  navLabel: string;
  image: string;
  gallery: string[];
  description: string;
  buttonLabel: string;
  quoteServiceValue: string;
  heroIntro: string;
  overview: string[];
  includes: string[];
  benefits: { title: string; text: string }[];
  process: { step: string; text: string }[];
}

export const SERVICES: ServicePage[] = [
  {
    id: 'residential',
    slug: 'residential-rubbish-removal-in-melbourne',
    title: 'Residential Rubbish Removal',
    shortTitle: 'Residential',
    navLabel: 'Residential Rubbish Removal',
    image: '/images/services-original/residential.webp?v=fridge-pile-20260919',
    gallery: [
      '/images/services-original/residential.webp?v=fridge-pile-20260919',
      '/images/lounge-junk-before.jpg?v=sofa-pile-20260919',
      '/images/garage-clean-before.jpg?v=ai-20260919',
      '/images/lounge-junk-after.jpg?v=ai-20260919',
    ],
    description:
      'From Melbourne houses to apartments – nothing is too much trouble. We remove your unwanted junk, rubbish, furniture & even fittings and carpet from where you tell us to.',
    buttonLabel: 'RESIDENTIAL',
    quoteServiceValue: 'Residential Rubbish Removal',
    heroIntro:
      'Clear furniture, mattresses, appliances, and household junk from any Melbourne home — we load, haul, and sweep so you don’t lift a finger.',
    overview: [
      'Whether you are decluttering a spare room, preparing a rental for inspection, or finally reclaiming the garage, our residential rubbish removal team handles the heavy work end to end.',
      'We collect from inside the property — upstairs, downstairs, sheds, and balconies — then sort for recycling and responsible disposal across Greater Melbourne.',
    ],
    includes: [
      'Old furniture, sofas, mattresses & beds',
      'Whitegoods & small appliances',
      'Carpet, underlay & fittings',
      'Garage & shed clearouts',
      'General household rubbish & packaging',
    ],
    benefits: [
      {
        title: 'We come to you',
        text: 'No nature-strip dumping required — we remove items from where they sit.',
      },
      {
        title: 'Fixed, clear quotes',
        text: 'Transparent pricing based on volume — no hidden tip fees after the job.',
      },
      {
        title: 'Same-day options',
        text: 'Need it gone today? Ask about same-day and next-day residential slots.',
      },
    ],
    process: [
      { step: '1. Tell us what to remove', text: 'Send photos or a quick list for a fast estimate.' },
      { step: '2. Book a time that suits', text: 'Choose a convenient Melbourne slot for our crew.' },
      { step: '3. We clear & tidy', text: 'Two-person team loads everything and sweeps the area.' },
    ],
  },
  {
    id: 'commercial',
    slug: 'commercial-rubbish-removal',
    title: 'Commercial Rubbish Removal',
    shortTitle: 'Commercial',
    navLabel: 'Commercial Rubbish Removal',
    image: '/images/services-original/commercial.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/commercial.webp?v=ai-20260919',
      '/images/office-clear-before.jpg?v=ai-20260919',
      '/images/warehouse-before.jpg?v=ai-20260919',
      '/images/office-clear-after.jpg?v=ai-20260919',
    ],
    description:
      "Be it Melbourne offices, warehouses or retail – we have you covered. We'll remove anything, from obsolete stock, IT or furniture and cubicles or even whole strip outs.",
    buttonLabel: 'COMMERCIAL',
    quoteServiceValue: 'Commercial Rubbish Removal',
    heroIntro:
      'Office strip-outs, warehouse clearances, and retail fit-out waste removed on your schedule — with loading-dock friendly crews across Melbourne.',
    overview: [
      'From CBD office decommissions to suburban warehouses, we coordinate with building managers and security to clear commercial rubbish efficiently and discreetly.',
      'Ideal for fit-outs, stock cleanouts, IT disposal, and end-of-lease handovers that need documentation and recycling certificates for ESG reporting.',
    ],
    includes: [
      'Office furniture, desks & cubicles',
      'IT equipment & e-waste sorting',
      'Retail fixtures & obsolete stock',
      'Warehouse cardboard & pallets',
      'Full floor or tenancy strip-outs',
    ],
    benefits: [
      {
        title: 'After-hours friendly',
        text: 'Weekend and evening slots available to minimise business disruption.',
      },
      {
        title: 'Site-aware crews',
        text: 'Experienced with docks, lifts, permits, and building access rules.',
      },
      {
        title: 'B2B ready',
        text: 'Invoices, recycling diversion notes, and reliable commercial turnaround.',
      },
    ],
    process: [
      { step: '1. Site brief', text: 'Share access notes, volume, and preferred timing.' },
      { step: '2. Scheduled crew', text: 'We arrive with the right truck for your dock or street.' },
      { step: '3. Cleared & documented', text: 'Space emptied, floors swept, paperwork provided.' },
    ],
  },
  {
    id: 'construction',
    slug: 'construction-rubbish-removal',
    title: 'Construction Rubbish Removal',
    shortTitle: 'Construction',
    navLabel: 'Construction Rubbish Removal',
    image: '/images/services-original/construction.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/construction.webp?v=ai-20260919',
      '/images/reno-debris-before.jpg?v=ai-20260919',
      '/images/reno-debris-after.jpg?v=ai-20260919',
      '/images/garage-clean-before.jpg?v=ai-20260919',
    ],
    description:
      'Reliable and fast Melbourne construction rubbish removal — we clean out any building or demolition site of rubbish and waste, or strip out fixtures and carpet for a safer worksite.',
    buttonLabel: 'CONSTRUCTION',
    quoteServiceValue: 'Construction Rubbish Removal',
    heroIntro:
      'Renovation debris, demolition waste, timber, plasterboard, and fixtures cleared fast so your Melbourne build site stays safe and productive.',
    overview: [
      'Builders, renovators, and homeowners use us to keep sites clear between trades. We remove mixed construction rubbish and leave work areas ready for the next stage.',
      'Our trucks handle bulky timber, tiles, plaster, and fixtures without the wait or footprint of a skip on a narrow Melbourne street.',
    ],
    includes: [
      'Timber, plasterboard & insulation offcuts',
      'Tiles, bricks & light demolition waste',
      'Kitchen & bathroom strip-out debris',
      'Carpet, underlay & fittings',
      'Mixed renovation rubbish bags',
    ],
    benefits: [
      {
        title: 'No skip permit hassle',
        text: 'Door-to-truck collection — ideal where skips are restricted.',
      },
      {
        title: 'Trade-friendly timing',
        text: 'Book around your program so sites stay clear between stages.',
      },
      {
        title: 'Safer workplaces',
        text: 'Less trip hazard and clutter means a cleaner, safer site.',
      },
    ],
    process: [
      { step: '1. Estimate the load', text: 'Photos of piles help us quote volume accurately.' },
      { step: '2. On-site collection', text: 'Crew loads debris straight from the work area.' },
      { step: '3. Back to work', text: 'Site is cleared so your next trade can continue.' },
    ],
  },
  {
    id: 'green-waste',
    slug: 'green-waste-removal',
    title: 'Green Waste Removal',
    shortTitle: 'Green Waste',
    navLabel: 'Green Waste Removal',
    image: '/images/services-original/greenwaste.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/greenwaste.webp?v=ai-20260919',
      '/images/garden-waste-before.jpg?v=ai-20260919',
      '/images/garden-waste-after.jpg?v=ai-20260919',
      '/images/services-original/greenwaste.webp?v=ai-20260919',
    ],
    description:
      'Melbourne green waste removal for branches, fallen storm trees, yard trimmings, soil, and garden cleanups. We rake and load, and 100% of organic green waste goes to mulch recycling.',
    buttonLabel: 'GREEN WASTE',
    quoteServiceValue: 'Green Waste',
    heroIntro:
      'Storm branches, lawn bags, and garden cleanups hauled away — organic green waste diverted to mulch recycling across Melbourne.',
    overview: [
      'After a storm or a big garden prune, piles of green waste can take over the yard. We load branches, clippings, and bags so your outdoor space is usable again.',
      'Where possible, organic material is delivered to mulch recycling partners rather than landfill — part of our eco-conscious disposal approach.',
    ],
    includes: [
      'Tree branches & storm debris',
      'Lawn clippings & garden bags',
      'Hedging & pruning waste',
      'Leaves, weeds & soft organics',
      'Light soil & garden cleanup piles',
    ],
    benefits: [
      {
        title: 'We rake & load',
        text: 'You point — we handle the heavy lifting and bagging on site.',
      },
      {
        title: 'Mulch-bound organics',
        text: 'Green waste is directed to recycling partners whenever possible.',
      },
      {
        title: 'Post-storm response',
        text: 'Ask about priority slots after severe Melbourne weather events.',
      },
    ],
    process: [
      { step: '1. Share yard photos', text: 'Helps us size the truck and quote fairly.' },
      { step: '2. Garden collection', text: 'Crew clears piles, bags, and debris from your property.' },
      { step: '3. Eco disposal', text: 'Organics head to mulch recycling where accepted.' },
    ],
  },
  {
    id: 'deceased-estate',
    slug: 'deceased-estate-clearance',
    title: 'Deceased Estate Clearance',
    shortTitle: 'Deceased Estate',
    navLabel: 'Deceased Estate Clearance',
    image: '/images/services-original/estate.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/estate.webp?v=ai-20260919',
      '/images/lounge-junk-before.jpg?v=sofa-pile-20260919',
      '/images/office-clear-before.jpg?v=ai-20260919',
      '/images/lounge-junk-after.jpg?v=ai-20260919',
    ],
    description:
      'Compassionate, respectful Melbourne deceased estate clearance near you. We sort belongings for donation or disposal, handle everything with care, and leave the property ready for sale.',
    buttonLabel: 'DECEASED ESTATE',
    quoteServiceValue: 'Deceased Estate',
    heroIntro:
      'Sensitive, respectful house clearances for Melbourne families — sorting for donation where possible and leaving the property ready for sale or settlement.',
    overview: [
      'Clearing a loved one’s home is emotional. Our team works patiently and respectfully, following your instructions on what to keep, donate, or remove.',
      'We can clear single rooms or entire properties, helping executors and families move forward with less stress.',
    ],
    includes: [
      'Full or partial house clearances',
      'Sorting for donation & disposal',
      'Furniture & household contents',
      'Garage, shed & outdoor items',
      'Final tidy for sale or handover',
    ],
    benefits: [
      {
        title: 'Compassionate crews',
        text: 'Trained to work with care and discretion in sensitive situations.',
      },
      {
        title: 'Donation-first mindset',
        text: 'Usable goods can be set aside for charity where appropriate.',
      },
      {
        title: 'Executor-friendly',
        text: 'Clear communication and flexible timing for family arrangements.',
      },
    ],
    process: [
      { step: '1. Walkthrough or photos', text: 'Agree what stays, donates, or goes.' },
      { step: '2. Careful clearance', text: 'Team works room by room at a respectful pace.' },
      { step: '3. Property ready', text: 'Home left tidy for sale, rental, or handover.' },
    ],
  },
  {
    id: 'piano-removal',
    slug: 'piano-removal',
    title: 'Piano Removal',
    shortTitle: 'Piano Removal',
    navLabel: 'Piano Removal',
    image: '/images/services-original/piano.jpg?v=wa-20261114',
    gallery: [
      '/images/services-original/piano.jpg?v=wa-20261114',
      '/images/services-original/residential.webp?v=fridge-pile-20260919',
      '/images/lounge-junk-before.jpg?v=sofa-pile-20260919',
      '/images/hero-truck-loading.jpg?v=ai-20260919',
    ],
    description:
      'Bulky upright and grand piano removal across Melbourne. Experienced team with heavy-duty piano dollies, straps, and protective blankets to avoid floor or wall damage.',
    buttonLabel: 'PIANO REMOVAL',
    quoteServiceValue: 'Piano Removal',
    heroIntro:
      'Upright and grand piano removal across Melbourne — specialist gear, careful handling, and protected floors, stairs, and doorways.',
    overview: [
      'Pianos are heavy, awkward, and easy to damage property with. We use piano dollies, straps, and blankets to remove uprights and grands safely from homes and venues.',
      'Whether the piano is unwanted, broken, or simply too large to keep, we handle the exit path so you don’t risk injury or scratched floors.',
    ],
    includes: [
      'Upright piano removal',
      'Grand & baby grand removal',
      'Stair and tight-access handling',
      'Floor & wall protection',
      'Disposal or recycling of unusable pianos',
    ],
    benefits: [
      {
        title: 'Specialist equipment',
        text: 'Dollies, straps, and blankets built for heavy instruments.',
      },
      {
        title: 'Property protection',
        text: 'We plan the path to minimise risk to stairs, doors, and flooring.',
      },
      {
        title: 'Experienced hands',
        text: 'Two-person (or more) teams sized to the instrument and access.',
      },
    ],
    process: [
      { step: '1. Access details', text: 'Stairs, lifts, and piano type help us prepare.' },
      { step: '2. Protected removal', text: 'Instrument is strapped, padded, and wheeled out.' },
      { step: '3. Clean exit', text: 'Space left clear — no scrapes left behind.' },
    ],
  },
  {
    id: 'metal-removal',
    slug: 'metal-scrap-removal',
    title: 'Metal & Scrap Removal',
    shortTitle: 'Metal & Scrap',
    navLabel: 'Metal & Scrap Removal',
    image: '/images/services-original/metal.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/metal.webp?v=ai-20260919',
      '/images/metal-scrap-before.jpg?v=ai-20260919',
      '/images/metal-scrap-after.jpg?v=ai-20260919',
      '/images/reno-debris-before.jpg?v=ai-20260919',
    ],
    description:
      'Recycle heavy scrap metal in Melbourne — old corrugated roofing, steel posts, car panels, appliances, and plumbing copper. Fast collection from trade sites and homes.',
    buttonLabel: 'METAL REMOVAL',
    quoteServiceValue: 'Metal Removal',
    heroIntro:
      'Scrap steel, roofing, appliances, and copper collected from Melbourne homes and trade sites — sorted for recycling wherever possible.',
    overview: [
      'From backyard scrap piles to renovation offcuts, we remove heavy metal waste and channel recyclable materials away from landfill.',
      'Tradies and homeowners alike use us for roofing iron, steel posts, whitegoods shells, and mixed scrap that is too heavy for the kerb.',
    ],
    includes: [
      'Corrugated roofing & steel sheets',
      'Appliances & whitegoods carcasses',
      'Steel posts, frames & offcuts',
      'Car panels & light auto scrap',
      'Copper & mixed plumbing metals',
    ],
    benefits: [
      {
        title: 'Heavy-lift ready',
        text: 'Crews equipped to move awkward, dense metal loads safely.',
      },
      {
        title: 'Recycling focused',
        text: 'Metals are sorted toward recycling streams when accepted.',
      },
      {
        title: 'Trade & home',
        text: ' equally suited to DIY cleanups and commercial scrap piles.',
      },
    ],
    process: [
      { step: '1. Describe the scrap', text: 'Type and volume help us quote and plan labour.' },
      { step: '2. On-site loading', text: 'We collect from yards, roofsides, or work areas.' },
      { step: '3. Recycled responsibly', text: 'Material directed to appropriate metal recycling.' },
    ],
  },
  {
    id: 'spa-removal',
    slug: 'spa-hot-tub-removal',
    title: 'Spa & Hot Tub Removal',
    shortTitle: 'Spa Removal',
    navLabel: 'Spa & Hot Tub Removal',
    image: '/images/services-original/spa.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/spa.webp?v=ai-20260919',
      '/images/spa-removal-before.jpg?v=ai-20260919',
      '/images/spa-removal-after.jpg?v=ai-20260919',
      '/images/garden-waste-before.jpg?v=ai-20260919',
    ],
    description:
      'Unwanted backyard spas, jacuzzis, and hot tubs removed across Melbourne — dismantled on-site safely and hauled away with zero damage to your fences.',
    buttonLabel: 'SPA REMOVAL',
    quoteServiceValue: 'Spa Removal',
    heroIntro:
      'Backyard spa and hot tub removal in Melbourne — cut down safely on site and hauled away without wrecking fences or paving.',
    overview: [
      'Old spas are bulky, heavy, and rarely fit through a side gate intact. We dismantle them on site with the right tools, then remove every piece.',
      'Perfect when you are reclaiming the patio, preparing a property for sale, or replacing an ageing spa that has become more hassle than luxury.',
    ],
    includes: [
      'Acrylic & fibreglass spa removal',
      'Hot tub & jacuzzi dismantling',
      'On-site cutting where required',
      'Haul-away of shell & debris',
      'Patio tidy after removal',
    ],
    benefits: [
      {
        title: 'Gate-friendly method',
        text: 'Cut-down approach for tight Melbourne side access.',
      },
      {
        title: 'Property care',
        text: 'We protect fences, paving, and landscaping during the job.',
      },
      {
        title: 'All-in removal',
        text: 'Shell, frame debris, and related junk leave in one visit.',
      },
    ],
    process: [
      { step: '1. Access check', text: 'Photos of the spa and side path help us quote.' },
      { step: '2. Dismantle on site', text: 'Safe cutting and breakdown in your backyard.' },
      { step: '3. Clear the patio', text: 'All pieces loaded — outdoor space returned to you.' },
    ],
  },
  {
    id: 'cardboard-removal',
    slug: 'cardboard-removal',
    title: 'Cardboard Removal',
    shortTitle: 'Cardboard',
    navLabel: 'Cardboard Removal',
    image: '/images/services-original/cardboard.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/cardboard.webp?v=ai-20260919',
      '/images/warehouse-before.jpg?v=ai-20260919',
      '/images/warehouse-after.jpg?v=ai-20260919',
      '/images/office-clear-before.jpg?v=ai-20260919',
    ],
    description:
      'Melbourne cardboard removal for piles of delivery boxes, packaging materials, and pallets from warehouses or residential moves — cleared in one trip for eco-conscious recycling.',
    buttonLabel: 'CARDBOARD',
    quoteServiceValue: 'Cardboard Removal',
    heroIntro:
      'Delivery boxes, packaging, and pallet cardboard cleared from Melbourne homes, offices, and warehouses — recycled whenever possible.',
    overview: [
      'Online orders and stock deliveries create mountains of cardboard. We clear boxes and packaging in one trip so your space stays usable.',
      'Ideal after moves, fit-outs, warehouse inbound shipments, or seasonal retail peaks.',
    ],
    includes: [
      'Flattened & unflattened boxes',
      'Packaging & paper waste',
      'Warehouse carton piles',
      'Moving-day cardboard stacks',
      'Light pallet & packing materials',
    ],
    benefits: [
      {
        title: 'One-trip clearout',
        text: 'Large volumes removed without multiple council collections.',
      },
      {
        title: 'Recycling first',
        text: 'Clean cardboard directed to recycling streams where accepted.',
      },
      {
        title: 'Home & warehouse',
        text: 'Scales from apartment moves to commercial inbound waste.',
      },
    ],
    process: [
      { step: '1. Estimate volume', text: 'Pile photos help us send the right truck.' },
      { step: '2. Fast load-out', text: 'Crew clears boxes from docks, hallways, or garages.' },
      { step: '3. Recycle & go', text: 'Cardboard processed for recycling when suitable.' },
    ],
  },
  {
    id: 'clean-ups',
    slug: 'clean-ups-hoarder-support',
    title: 'Clean Ups & Hoarder Support',
    shortTitle: 'Clean Ups',
    navLabel: 'Clean Ups & Hoarder Support',
    image: '/images/services-original/cleanups.webp?v=ai-20260919',
    gallery: [
      '/images/services-original/cleanups.webp?v=ai-20260919',
      '/images/garage-clean-before.jpg?v=ai-20260919',
      '/images/garage-clean-after.jpg?v=ai-20260919',
      '/images/lounge-junk-before.jpg?v=sofa-pile-20260919',
    ],
    description:
      'Our Melbourne clean-up services include NDIS support, deceased estates, hoarders, spring cleans through to tenants dumped rubbish. We are here to get things cleaned up for you.',
    buttonLabel: 'CLEAN UPS',
    quoteServiceValue: 'Clean Ups',
    heroIntro:
      'NDIS-friendly clean ups, hoarding support, tenant dumped rubbish, and deep household clearances — patient Melbourne crews who get the job done.',
    overview: [
      'Some clearances need more than a standard junk run. We support families, carers, and property managers with thorough clean ups handled respectfully and thoroughly.',
      'From spring cleans to complex hoarding situations, we work at a pace that suits the people involved and leave spaces safer and more liveable.',
    ],
    includes: [
      'Hoarding support clearances',
      'NDIS-related clean up assistance',
      'Tenant dumped rubbish removal',
      'Spring & deep household cleans (junk focus)',
      'Multi-room progressive clearouts',
    ],
    benefits: [
      {
        title: 'Patient approach',
        text: 'We work with care — especially in sensitive or complex homes.',
      },
      {
        title: 'Whole-home capacity',
        text: 'Can stage clearances room by room if needed.',
      },
      {
        title: 'Property managers welcome',
        text: 'Reliable help for bond cleans and dumped-goods scenarios.',
      },
    ],
    process: [
      { step: '1. Confidential brief', text: 'Share the situation and priority areas safely.' },
      { step: '2. Planned clearance', text: 'Crew works systematically through agreed spaces.' },
      { step: '3. Safer space', text: 'Junk gone — home left clearer and more usable.' },
    ],
  },
];

export function getServiceBySlug(slug: string): ServicePage | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getServiceById(id: string): ServicePage | undefined {
  return SERVICES.find((s) => s.id === id);
}
