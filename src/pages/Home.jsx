import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BusinessCard from '../components/BusinessCard';
import BusinessModal from '../components/BusinessModal';
import MapView from '../components/MapView';
import { supabase } from '../lib/supabase';
import './Home.css';

// Keys and values are both normalized (lowercase, no spaces/hyphens) at search time.
// Map common shorthand → the canonical term to search for.
const SEARCH_SYNONYMS = {
  // ── IV Therapy ──
  'iv': 'ivtherapy',
  'ivs': 'ivtherapy',
  'ivdrip': 'ivtherapy',
  'drip': 'ivtherapy',
  'drips': 'ivtherapy',
  'infusion': 'ivtherapy',
  'vitamindrip': 'ivtherapy',
  'myerscocktail': 'ivtherapy',
  'myers': 'ivtherapy',
  'ivinfusion': 'ivtherapy',
  'vitaminiv': 'ivtherapy',
  'hydration': 'ivtherapy',

  // ── Red Light Therapy ──
  'redlight': 'redlight',
  'rlt': 'redlight',
  'pbm': 'photobiomodulation',
  'lllt': 'laser',
  'lowlevellaser': 'laser',
  'coldlaser': 'laser',
  'softlaser': 'laser',
  'laser': 'laser',
  'photobio': 'photobiomodulation',
  'vielight': 'transcranial',
  'joovv': 'redlight',
  'redlightbed': 'redlight',
  'redlightpanel': 'redlight',

  // ── Infrared Sauna ──
  'infrared': 'infrared',
  'irsauna': 'infrared',
  'farinfrared': 'infrared',
  'fir': 'infrared',
  'nearinfrared': 'nearinfrared',
  'nir': 'nearinfrared',
  'fullspectrum': 'fullspectrum',
  'clearlight': 'infrared',
  'sunlighten': 'infrared',

  // ── Sauna (general) ──
  'sauna': 'sauna',
  'steam': 'steam',
  'steamroom': 'steam',
  'wetsteam': 'steam',
  'finnishsauna': 'finnish',
  'drysauna': 'finnish',
  'traditionalsauna': 'finnish',
  'woodburning': 'finnish',
  'sweat': 'sauna',

  // ── Cold / Cryo ──
  'cryo': 'cryo',
  'cryotherapy': 'cryotherapy',
  'cryochamber': 'cryotherapy',
  'freeze': 'cryotherapy',
  'freezing': 'cryotherapy',
  'wbc': 'cryotherapy',
  'wholebodycryo': 'cryotherapy',
  'cryofacial': 'cryofacial',
  'icefacial': 'cryofacial',
  'coldplunge': 'coldplunge',
  'coldtub': 'coldplunge',
  'icebath': 'coldplunge',
  'iceplunge': 'coldplunge',
  'plunge': 'coldplunge',
  'coldwater': 'coldplunge',
  'contrast': 'contrast',
  'hotcold': 'contrast',
  'saunaplunge': 'contrast',

  // ── Hyperbaric ──
  'hbot': 'hyperbaric',
  'hyperbaric': 'hyperbaric',
  'oxygenchamber': 'hyperbaric',
  'oxygentherapy': 'hyperbaric',
  'pressurechamber': 'hyperbaric',
  'chamber': 'hyperbaric',
  'hardshell': 'hyperbaric',
  'softshell': 'hyperbaric',

  // ── Ozone ──
  'ozone': 'ozone',
  'o3': 'ozone',
  'ozonation': 'ozone',
  'prolozone': 'prolozone',
  'ozoneinjection': 'prolozone',
  'eboo': 'eboo',
  'bloodozone': 'eboo',
  'ewot': 'ewot',
  'exerciseoxygen': 'ewot',
  'liveo2': 'ewot',
  'hocatt': 'hocatt',
  'hydrogen': 'hydrogen',
  'hydrogenwater': 'hydrogen',
  'molecularhydrogen': 'hydrogen',
  'nanovi': 'nanovi',

  // ── PEMF ──
  'pemf': 'pemf',
  'pulsed': 'pemf',
  'electromagnetic': 'pemf',
  'pulsepemf': 'pemf',
  'bemer': 'pemf',

  // ── Vagus / Frequency ──
  'vagus': 'vagus',
  'vns': 'vagus',
  'apollo': 'apollo',
  'grounding': 'grounding',
  'earthing': 'grounding',
  'rife': 'rife',
  'rasha': 'rasha',

  // ── Vibration ──
  'vibration': 'vibration',
  'wbv': 'vibration',
  'powerplate': 'vibration',
  'vibrationplate': 'vibration',
  'lifepro': 'vibration',
  'hypervibe': 'vibration',

  // ── Float Therapy ──
  'float': 'float',
  'floating': 'float',
  'floattank': 'float',
  'floatation': 'float',
  'floatpod': 'float',
  'sensory': 'sensorydeprivation',
  'sensorydep': 'sensorydeprivation',
  'isolationtank': 'sensorydeprivation',
  'deprivation': 'sensorydeprivation',

  // ── Compression ──
  'compression': 'compression',
  'normatec': 'compression',
  'recoveryboots': 'compression',
  'boots': 'compression',
  'pressotherapy': 'compression',
  'rapidreboot': 'compression',
  'airrelax': 'compression',
  'pneumatic': 'compression',

  // ── Lymphatic ──
  'lymphatic': 'lymphatic',
  'lymph': 'lymphatic',
  'lymphdrainage': 'lymphatic',

  // ── Massage & Bodywork ──
  'massage': 'massage',
  'bodywork': 'massage',
  'deeptissue': 'massage',
  'swedish': 'massage',
  'sportsmassage': 'massage',
  'thaimassage': 'massage',
  'myofascial': 'myofascial',
  'foamrolling': 'myofascial',
  'fascia': 'myofascial',
  'rolfing': 'rolfing',
  'structuralintegration': 'rolfing',
  'craniosacral': 'craniosacral',
  'cst': 'craniosacral',
  'cupping': 'cupping',
  'cups': 'cupping',
  'iastm': 'iastm',
  'graston': 'iastm',
  'scraping': 'iastm',
  'kinesiotape': 'kinesiology',
  'kttape': 'kinesiology',
  'taping': 'kinesiology',
  'stretch': 'stretch',
  'stretching': 'stretch',
  'assistedstretch': 'stretch',
  'dryneedling': 'dryneedling',
  'needling': 'dryneedling',
  'manuatherapy': 'manual',
  'manualtherapy': 'manual',

  // ── Physical Therapy / Rehab ──
  'pt': 'physicaltherapy',
  'physio': 'physicaltherapy',
  'physiotherapy': 'physicaltherapy',
  'rehab': 'physicaltherapy',
  'rehabilitation': 'physicaltherapy',
  'arpwave': 'arp',

  // ── Neurofeedback / Brain ──
  'neurofeedback': 'neurofeedback',
  'braintraining': 'neurofeedback',
  'neuroptimal': 'neurofeedback',
  'lens': 'neurofeedback',
  'eeg': 'eeg',
  'qeeg': 'eeg',
  'brainmapping': 'eeg',
  'brainmap': 'eeg',
  'biofeedback': 'biofeedback',
  'hrv': 'hrv',
  'heartratevariability': 'hrv',
  'braintap': 'braintap',
  'tdcs': 'tdcs',
  'transcranialcurrent': 'tdcs',
  'tms': 'tms',
  'transcranialmagnet': 'tms',
  'brainstim': 'tms',
  'cognitivetraining': 'cognitive',
  'executivefunction': 'cognitive',

  // ── Mind / Mental ──
  'meditation': 'meditation',
  'guidedmeditation': 'meditation',
  'mindfulness': 'mindfulness',
  'mbsr': 'mindfulness',
  'breathwork': 'breathwork',
  'breathing': 'breathwork',
  'wimhof': 'breathwork',
  'boxbreathing': 'breathwork',
  'holotropic': 'breathwork',
  'hypnotherapy': 'hypnotherapy',
  'hypnosis': 'hypnotherapy',
  'soundhealing': 'sound',
  'soundbath': 'sound',
  'singingbowls': 'sound',
  'soundtherapy': 'sound',
  'binauralbeats': 'binaural',
  'binaural': 'binaural',
  'visualizationtraining': 'visualization',
  'mentaltraining': 'visualization',
  'vrtherapy': 'virtual',
  'virtualreality': 'virtual',
  'sleeptherapy': 'sleep',
  'sleepoptimization': 'sleep',
  'psychedelic': 'psychedelic',
  'ketamine': 'ketamine',
  'plantmedicine': 'psychedelic',

  // ── Halotherapy ──
  'salt': 'halotherapy',
  'saltroom': 'halotherapy',
  'saltcave': 'halotherapy',
  'salttherapy': 'halotherapy',
  'halo': 'halotherapy',
  'halogenerator': 'halotherapy',

  // ── Chiropractic ──
  'chiro': 'chiropractic',
  'chiropractor': 'chiropractic',
  'adjustment': 'chiropractic',
  'spinal': 'chiropractic',
  'spineadjustment': 'chiropractic',

  // ── Acupuncture / TCM ──
  'acupuncture': 'acupuncture',
  'acupuncturist': 'acupuncture',
  'tcm': 'chinese',
  'chinesemedicine': 'chinese',
  'traditionalchinese': 'chinese',

  // ── Holistic ──
  'reiki': 'reiki',
  'energyhealing': 'reiki',
  'ayurveda': 'ayurvedic',
  'ayurvedic': 'ayurvedic',
  'homeopathy': 'homeopathy',
  'homeopathic': 'homeopathy',
  'naturopath': 'naturopathic',
  'nd': 'naturopathic',
  'functionalmedicine': 'functional',
  'functionalmed': 'functional',
  'rootcause': 'functional',
  'integrativemedicine': 'integrative',
  'colonics': 'colon',
  'colonicirrigaton': 'colon',
  'colonhydrotherapy': 'colon',
  'colonhydro': 'colon',
  'coloncleanse': 'colon',
  'cannabis': 'cannabis',
  'medicalcannabis': 'cannabis',
  'medicalmj': 'cannabis',
  'nutrition': 'nutrition',
  'nutritionist': 'nutrition',
  'dietitian': 'nutrition',
  'nutritionalcounseling': 'nutrition',

  // ── PRP / Plasma / Stem ──
  'prp': 'prp',
  'platelet': 'prp',
  'plateletrichplasma': 'prp',
  'plasma': 'plasma',
  'coldplasma': 'plasma',
  'stemcell': 'stem',
  'stemcells': 'stem',
  'regenerative': 'stem',
  'exosomes': 'exosome',
  'exosome': 'exosome',
  'chelation': 'chelation',
  'edta': 'chelation',
  'heavymetalchelation': 'chelation',
  'neuraltherapy': 'neural',

  // ── Diagnostics ──
  'bloodtest': 'blood',
  'bloodwork': 'blood',
  'bloodpanel': 'blood',
  'labs': 'blood',
  'labwork': 'blood',
  'dexa': 'dexa',
  'dxa': 'dexa',
  'bodycomposition': 'dexa',
  'bodyscan': 'dexa',
  'bonedensity': 'bone',
  'bonescan': 'bone',
  'cgm': 'glucose',
  'glucosemonitor': 'glucose',
  'continuousglucose': 'glucose',
  'genetictest': 'dna',
  'dnatest': 'dna',
  'genetics': 'dna',
  'guttest': 'microbiome',
  'guthealth': 'microbiome',
  'microbiome': 'microbiome',
  'gutbacteria': 'microbiome',
  'hormonetest': 'hormone',
  'hormones': 'hormone',
  'testosterone': 'testosterone',
  'hormonepanel': 'hormone',
  'inbody': 'inbody',
  'bia': 'inbody',
  'foodsensitivity': 'food',
  'foodallergy': 'food',
  'foodintolerance': 'food',
  'mri': 'mri',
  'fullbodymri': 'mri',
  'wholebody': 'mri',
  'heavymetals': 'toxicity',
  'toxicity': 'toxicity',
  'metaltest': 'toxicity',
  'vo2': 'vo2',
  'vo2max': 'vo2',
  'aerobiccapacity': 'vo2',
  'pnoe': 'pnoe',
  'rmr': 'metabolic',
  'metabolicrate': 'metabolic',
  'metabolictesting': 'metabolic',
  'biologicalage': 'biological',
  'epigenetic': 'biological',
  'thermography': 'thermography',
  'thermalimaging': 'thermography',
  'wearable': 'wearable',
  'oura': 'wearable',
  'whoop': 'wearable',
  'posture': 'postural',
  'posturalassessment': 'postural',
  'lactatethreshold': 'lactate',
  'liveblood': 'blood',
  'visceral': 'visceral',
  'viscerolfat': 'visceral',
  'nutrigenomics': 'nutrigenomic',

  // ── Performance & Fitness ──
  'yoga': 'yoga',
  'pilates': 'pilates',
  'personaltraining': 'personal',
  'personaltrainer': 'personal',
  'hiit': 'hiit',
  'highintensity': 'hiit',
  'intervaltraining': 'hiit',
  'carolbike': 'carol',
  'bfr': 'bfr',
  'bloodflowrestriction': 'bfr',
  'occlusiontraining': 'bfr',
  'trx': 'trx',
  'suspensiontraining': 'trx',
  'arx': 'arx',
  'adaptiveresistance': 'arx',
  'vasper': 'vasper',
  'mat': 'muscleactivation',
  'muscleactivation': 'muscleactivation',
  'strengthtraining': 'strength',
  'strengthconditioning': 'strength',
  'conditioning': 'strength',

  // ── NAD+ ──
  'nad': 'nad',
  'nadplus': 'nad',
  'nad+': 'nad',
  'nicotinamide': 'nad',
  'nmn': 'nmn',
  'nr': 'nicotinamide',
  'nicotinamideriboside': 'nicotinamide',

  // ── Peptides (specific) ──
  'peptide': 'peptide',
  'peptides': 'peptide',
  'bpc': 'bpc157',
  'bpc157': 'bpc157',
  'tb500': 'tb500',
  'tb4': 'thymosin',
  'thymosin': 'thymosin',
  'ipamorelin': 'ipamorelin',
  'cjc': 'cjc1295',
  'cjc1295': 'cjc1295',
  'sermorelin': 'sermorelin',
  'ghrp': 'ghrp',
  'aod': 'aod9604',
  'aod9604': 'aod9604',
  'hghfragment': 'hghfragment',
  'mk677': 'mk677',
  'ibutamoren': 'mk677',
  'ghkcu': 'ghk',
  'ghk': 'ghk',
  'epithalon': 'epithalon',
  'selank': 'selank',
  'semax': 'semax',
  'pt141': 'pt141',
  'bremelanotide': 'pt141',
  'cerebrolysin': 'cerebrolysin',
  'kisspeptin': 'kisspeptin',
  'dihexa': 'dihexa',
  'growthhormone': 'hgh',
  'hgh': 'hgh',
  'gh': 'hgh',

  // ── Hormone & Optimization ──
  'trt': 'testosterone',
  'semaglutide': 'semaglutide',
  'ozempic': 'semaglutide',
  'wegovy': 'semaglutide',
  'tirzepatide': 'tirzepatide',
  'mounjaro': 'tirzepatide',
  'weightloss': 'semaglutide',
  'glp1': 'semaglutide',
  'dhea': 'dhea',
  'pregnenolone': 'pregnenolone',
  'hcg': 'hcg',
  'mic': 'mic',
  'lipo': 'mic',
  'melatonin': 'melatonin',
  'thyroid': 'thyroid',

  // ── Glutathione / Vitamins ──
  'glutathione': 'glutathione',
  'vitaminc': 'vitaminc',
  'highdosec': 'vitaminc',
  'alphalipoic': 'alphalipoic',
  'ala': 'alphalipoic',
  'b12': 'b12',
  'bcomplex': 'b12',
  'magnesium': 'magnesium',
  'zinc': 'zinc',
  'coq10': 'coenzyme',
  'coenzymeq10': 'coenzyme',
  'aminoacid': 'amino',
  'biotin': 'biotin',
  'phosphatidylcholine': 'phosphatidylcholine',
  'pc': 'phosphatidylcholine',
};

const QUICK_FILTERS = [
  { label: 'All',        icon: '✦',  query: '' },
  { label: 'Red Light',  icon: '🔴', query: 'Red Light' },
  { label: 'Cryo',       icon: '❄️', query: 'Cryo' },
  { label: 'Peptides',   icon: '💉', query: 'Peptide' },
  { label: 'Sauna',      icon: '🧖', query: 'Sauna' },
  { label: 'Float',      icon: '🌊', query: 'Float' },
  { label: 'Hyperbaric', icon: '🫁', query: 'Hyperbaric' },
  { label: 'PEMF',       icon: '⚡', query: 'PEMF' },
  { label: 'IV Therapy', icon: '💧', query: 'IV' },
];

const TICKER_TERMS = [
  'NAD+', 'BPC-157', 'Red Light Bed', 'PEMF', 'Cold Plunge',
  'Infrared Sauna', 'Cryotherapy', 'Float Tank', 'Sermorelin',
  'Hyperbaric', 'Semaglutide', 'Glutathione IV', 'NormaTec',
];

const STATS = [
  { value: '500+', label: 'Businesses' },
  { value: '80+',  label: 'Modalities' },
  { value: '50+',  label: 'Peptides & Nutrients' },
];

const HOW_IT_WORKS = [
  {
    n: '1',
    title: 'Search',
    desc: 'Type any therapy, device, or peptide — like "NAD+" or "Red Light Bed".',
  },
  {
    n: '2',
    title: 'Discover',
    desc: 'See verified businesses near you offering exactly what you need.',
  },
  {
    n: '3',
    title: 'Connect',
    desc: 'Call, get directions, or book in one tap.',
  },
];

function distanceMi(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Transform Supabase row → shape the rest of the app expects
function transformBusiness(row) {
  return {
    ...row,
    modalities: (row.business_modalities || [])
      .map(bm => bm.modalities)
      .filter(Boolean),
  };
}

export default function Home() {
  const [businesses, setBusinesses]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [loadError, setLoadError]             = useState('');
  const [query, setQuery]                     = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [viewMode, setViewMode]               = useState('list');
  const [userLocation, setUserLocation]       = useState(null);
  const [locationError, setLocationError]     = useState('');
  const [locating, setLocating]               = useState(false);
  const [hoveredCardId, setHoveredCardId]     = useState(null);
  const [hoveredPinId, setHoveredPinId]       = useState(null);
  const inputRef     = useRef(null);
  const cardRefs     = useRef({});
  const mapCenterRef = useRef(null);
  const resultsRef   = useRef(null);

  // Fetch approved businesses from Supabase on mount
  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*, business_modalities(modalities(id, name, category))')
          .eq('status', 'approved');

        if (error) throw error;
        setBusinesses((data || []).map(transformBusiness));
      } catch (err) {
        console.error('Failed to load businesses:', err);
        setLoadError('Unable to load listings. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, []);

  const activeQuickFilter = QUICK_FILTERS.find(f =>
    f.query !== '' && query.toLowerCase() === f.query.toLowerCase()
  ) || (query === '' ? QUICK_FILTERS[0] : null);

  const filtered = useMemo(() => {
    const normalize = (s) => s.toLowerCase().replace(/[\s\-–_]/g, '');
    const raw = normalize(query);
    const q = SEARCH_SYNONYMS[raw] || raw;
    const matchField = (val) => normalize(val || '').includes(q);
    let list = q
      ? businesses.filter((b) =>
          matchField(b.name) ||
          matchField(b.city) ||
          matchField(b.state) ||
          b.modalities.some((m) => matchField(m.name))
        )
      : [...businesses];

    if (userLocation) {
      list = list
        .map(b => ({
          ...b,
          _dist: b.latitude && b.longitude
            ? distanceMi(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
            : Infinity,
        }))
        .sort((a, b) => a._dist - b._dist);
    }
    return list;
  }, [query, userLocation, businesses]);

  function applyFilter(q) {
    setQuery(q);
    if (q) inputRef.current?.blur();
  }

  function handleNearMe() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocating(false);
        mapCenterRef.current?.(loc);
        setViewMode('list');
      },
      () => {
        setLocationError('Enable location to find businesses near you.');
        setLocating(false);
      }
    );
  }

  // Called by MapView when a pin is clicked on mobile floating card scenario
  const handlePinClick = useCallback((business) => {
    setSelectedBusiness(business);
    // Also scroll card into view if in list mode
    const el = cardRefs.current[business.id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleCardHover = useCallback((id) => setHoveredCardId(id), []);
  const handleCardLeave = useCallback(() => setHoveredCardId(null), []);
  const handlePinHover  = useCallback((id) => {
    setHoveredPinId(id);
    const el = cardRefs.current[id];
    if (el && viewMode === 'list') el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [viewMode]);
  const handlePinLeave  = useCallback(() => setHoveredPinId(null), []);

  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">The Wellness Discovery Platform</div>

          <h1 className="hero-title">
            Find The Exact Wellness<br className="hero-br" /> Experience You're Looking For
          </h1>

          <p className="hero-subtitle">
            Search by therapy, device, or peptide. Discover clinics near you offering exactly what you need.
          </p>

          {/* Search bar + Near Me */}
          <div className="hero-search">
            <div className="hero-search-wrap">
              <svg className="hero-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                className="hero-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query) {
                    const top = resultsRef.current?.getBoundingClientRect().top + window.scrollY - 12;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
                placeholder="Search NAD+, Red Light Therapy, PEMF…"
              />
              {query && (
                <button className="hero-search-clear" onClick={() => setQuery('')} type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              <button className="hero-search-btn" type="button" onClick={() => {
                if (query) {
                  const top = resultsRef.current?.getBoundingClientRect().top + window.scrollY - 12;
                  window.scrollTo({ top, behavior: 'smooth' });
                } else {
                  inputRef.current?.focus();
                }
              }}>
                Search
              </button>
            </div>

            {/* Near Me */}
            <button
              className={`near-me-btn${userLocation ? ' active' : ''}${locating ? ' locating' : ''}`}
              type="button"
              onClick={handleNearMe}
              title="Sort by distance"
              aria-label="Near me"
            >
              {locating ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              )}
              <span className="near-me-label">Near Me</span>
            </button>
          </div>

          {locationError && (
            <p className="location-error">{locationError}</p>
          )}

          {/* Scrolling ticker */}
          <div className="ticker-wrap" aria-hidden="true">
            <div className="ticker-track">
              {[...TICKER_TERMS, ...TICKER_TERMS].map((term, i) => (
                <button key={i} className="ticker-pill" type="button" onClick={() => applyFilter(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {STATS.map(({ value, label }) => (
              <div key={label} className="hero-stat">
                <span className="hero-stat-value">{value}</span>
                <span className="hero-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <div className="hiw-inner">
          <p className="hiw-eyebrow">How It Works</p>
          <div className="hiw-steps">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.n} className="hiw-step">
                <div className="hiw-num">{s.n}</div>
                <div className="hiw-step-body">
                  <h3 className="hiw-title">{s.title}</h3>
                  <p className="hiw-desc">{s.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && <div className="hiw-connector" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="home-content" ref={resultsRef}>

        {/* Quick filters */}
        <div className="quick-filters-wrap">
          <div className="quick-filters">
            {QUICK_FILTERS.map((f) => {
              const isActive = activeQuickFilter?.label === f.label;
              return (
                <button
                  key={f.label}
                  className={`quick-filter${isActive ? ' active' : ''}`}
                  onClick={() => applyFilter(f.query)}
                  type="button"
                >
                  <span className="quick-filter-icon">{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'map' ? ' active' : ''}`}
            onClick={() => setViewMode('map')}
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Map
          </button>
        </div>

        {/* Map (always mounted, CSS-toggled) */}
        <div className={`map-section${viewMode === 'map' ? ' map-section--visible' : ''}`}>
          <MapView
            businesses={filtered}
            onBusinessClick={handlePinClick}
            isVisible={viewMode === 'map'}
            hoveredCardId={hoveredCardId}
            onPinHover={handlePinHover}
            onPinLeave={handlePinLeave}
            onRegisterCenter={(fn) => { mapCenterRef.current = fn; }}
          />
        </div>

        {/* Results header + grid (list mode only) */}
        {viewMode === 'list' && (
          <>
            {!loading && !loadError && (
              <div className="results-header">
                <span className="results-count">
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? 'business' : 'businesses'}
                  {userLocation ? ' near you' : ' found'}
                  {query && <span className="results-query"> for "<em>{query}</em>"</span>}
                </span>
                <div className="results-actions">
                  {userLocation && (
                    <button className="results-clear" onClick={() => setUserLocation(null)} type="button">
                      Clear location
                    </button>
                  )}
                  {query && (
                    <button className="results-clear" onClick={() => setQuery('')} type="button">
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}

            {loadError && (
              <div className="load-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {loadError}
              </div>
            )}

            {loading ? (
              <div className="business-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-stripe" />
                    <div className="skeleton-body">
                      <div className="skeleton-line skeleton-title" />
                      <div className="skeleton-line skeleton-sub" />
                      <div className="skeleton-line skeleton-desc" />
                      <div className="skeleton-tags">
                        <div className="skeleton-tag" />
                        <div className="skeleton-tag" />
                        <div className="skeleton-tag" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loadError && filtered.length > 0 ? (
              <div className="business-grid">
                {filtered.map((b, i) => (
                  <div
                    key={b.id}
                    ref={el => { cardRefs.current[b.id] = el; }}
                    onMouseEnter={() => handleCardHover(b.id)}
                    onMouseLeave={handleCardLeave}
                  >
                    <BusinessCard
                      business={b}
                      onClick={setSelectedBusiness}
                      animIndex={i}
                      distance={b._dist}
                      highlighted={hoveredPinId === b.id}
                    />
                  </div>
                ))}
              </div>
            ) : !loadError ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No businesses found</h3>
                <p>No results for "<strong>{query}</strong>". Try a different search or <Link to="/submit">list your business</Link>.</p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {selectedBusiness && (
        <BusinessModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      )}

      {/* ── Footer CTA ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="footer-logo-mark">M</div>
            <span>Modality <span className="footer-logo-accent">Map</span></span>
          </div>
          <h2 className="footer-title">Are You a Wellness Business?</h2>
          <p className="footer-sub">
            Get discovered by people searching for exactly what you offer. Listing is free.
          </p>
          <Link to="/submit" className="footer-cta">List Your Business →</Link>
          <p className="footer-copy">© 2025 Modality Map · The Wellness Discovery Platform</p>
        </div>
      </footer>

      {/* ── Bottom tab bar (mobile) ── */}
      <nav className="bottom-tabs" aria-label="Mobile navigation">
        <Link to="/" className="bottom-tab active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>
        <button className="bottom-tab" onClick={() => setViewMode(v => v === 'map' ? 'list' : 'map')} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Map</span>
        </button>
        <button className="bottom-tab" onClick={() => inputRef.current?.focus()} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </button>
        <Link to="/submit" className="bottom-tab">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>List</span>
        </Link>
      </nav>
    </main>
  );
}
