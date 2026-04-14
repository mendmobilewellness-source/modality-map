import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Submit.css';

const STEP_LABELS = ['Business Info', 'Offerings', 'Review & Submit'];

const DAY_KEYS   = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const EMPTY_HOURS = { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' };

const EMPTY_FORM = {
  name: '', description: '', address: '', city: '', state: '', zip: '',
  phone: '', website: '', modalities: [], ivDripsText: '',
  hours: { ...EMPTY_HOURS },
  walkIn: '',
};

// ── Category structure (alphabetical within each) ────────────────────────────
const CATEGORIES = [
  {
    name: 'Light & Photobiomodulation',
    modalities: [
      'Cold Laser Therapy',                    // moved from Recovery & Bodywork — it IS laser therapy
      'Low Level Laser Therapy (LLLT)',
      'Multi-Wavelength Photobiomodulation',
      'Photobiomodulation',
      'Pulsed Xenon UV Therapy',
      'Red Light Therapy',
      'Transcranial Photobiomodulation',
    ],
  },
  {
    name: 'Temperature Therapies',
    modalities: [
      'Cold Plunge',
      'Contrast Therapy',
      'Cryofacial',
      'Cryotherapy',
      'Full Spectrum Infrared Sauna',
      'Halotherapy / Salt Therapy',            // moved from Mind & Neurology — salt air is atmospheric/respiratory, not neurology
      'Infrared Sauna',
      'Near Infrared Sauna',
      'Steam Sauna',
      'Traditional Finnish Sauna',
    ],
  },
  {
    name: 'Oxygen & Ozone',
    modalities: [
      'EBOO (Extracorporeal Blood Ozonation & Oxygenation)',
      'EWOT (Exercise with Oxygen Therapy)',
      'HOCATT Therapy',
      'Hyperbaric Oxygen (HBOT)',
      'Molecular Hydrogen Therapy',
      'NanoVi',
      'Ozone Therapy',
      'Prolozone Therapy',
    ],
  },
  {
    name: 'Frequency & Energy',
    modalities: [
      'Apollo Neuro (Vagus Nerve Stimulation)',
      'Grounding / Earthing Therapy',
      'PEMF Therapy',
      'RASHA',
      'Rife Machine / Rife Therapy',
      'Vagus Nerve Stimulation',
      'Whole Body Vibration Therapy',
      // Removed: ARP Wave Therapy (duplicate — already in Recovery & Bodywork where it belongs)
      // Removed: BrainTap (duplicate — already in Mind & Neurology where it belongs)
      // Removed: Biofeedback (moved to Mind & Neurology — it's a nervous system training tool)
      // Removed: Neural Therapy (moved to Traditional & Holistic — it's a procaine injection technique)
    ],
  },
  {
    name: 'Infusion & Injection',
    modalities: [
      'Chelation Therapy',
      'Exosome Therapy',
      'IV Therapy',
      'Neural Therapy',                        // moved from Frequency & Energy — it's a local anesthetic injection technique
      'Plasma Therapy',
      'PRP Therapy',
      'Stem Cell Therapy',
    ],
  },
  {
    name: 'Recovery & Bodywork',
    modalities: [
      'ARP Wave Therapy',
      'Body Rolling / Myofascial Release',
      'Compression Therapy',
      'Craniosacral Therapy',
      'Cupping Therapy',
      'Dry Needling',
      'Float Tank / Sensory Deprivation',
      'Instrument Assisted Soft Tissue Mobilization (IASTM)',
      'Kinesiology Taping',
      'Lymphatic Drainage',
      'Manual Therapy',
      'Massage Therapy',
      'Physical Therapy',                      // moved from Performance & Fitness — it's rehab/recovery
      'Rolfing / Structural Integration',
      'Sports Massage',
      'Stretch Therapy',
      // Removed: Cold Laser Therapy (moved to Light & Photobiomodulation)
    ],
  },
  {
    name: 'Mind & Neurology',
    modalities: [
      'Binaural Beats Therapy',
      'Biofeedback',                           // moved from Frequency & Energy — it's a mind/nervous system training tool
      'BrainTap',
      'Breathwork',
      'Cognitive Training',
      'EEG Brain Mapping / qEEG',
      'Executive Function Training',
      'Guided Meditation',
      'Heart Rate Variability (HRV) Training',
      'Hypnotherapy',
      'Isochronic Tones Therapy',
      'LENS Neurofeedback',
      'Mindfulness Based Stress Reduction (MBSR)',
      'NeurOptimal Neurofeedback',
      'Neurofeedback',
      'Psychedelic Assisted Therapy',
      'Sleep Optimization Therapy',
      'Sound Healing',
      'Transcranial Direct Current Stimulation (tDCS)',
      'Transcranial Magnetic Stimulation (TMS)',
      'Virtual Reality Therapy',
      'Visualization Training',
      // Removed: Halotherapy / Salt Therapy (moved to Temperature Therapies)
      // Removed: qEEG Brain Mapping (duplicate of EEG Brain Mapping / qEEG above)
    ],
  },
  {
    name: 'Traditional & Holistic',
    modalities: [
      'Acupuncture',
      'Ayurvedic Medicine',
      'Chiropractic',
      'Colon Hydrotherapy',
      'Energy Healing / Reiki',
      'Functional Medicine Consultation',
      'Homeopathy',
      'Integrative Medicine',
      'Medical Cannabis Consultation',
      'Naturopathic Medicine',
      'Nutritional Counseling',
      'Traditional Chinese Medicine (TCM)',
    ],
  },
  {
    name: 'Diagnostics & Testing',
    modalities: [
      '3D Body Composition Analysis',
      'Biological Age Testing',
      'Blood Panel / Comprehensive Lab Work',
      'Bone Density Scan',
      'Continuous Glucose Monitor (CGM) Consultation',
      'DEXA Scan',
      'DNA / Genetic Testing',
      'Exercise Physiology Consultation',      // moved from Performance — it's an assessment/consultation
      'Food Sensitivity Testing',
      'Full Body MRI',
      'Gut Microbiome Testing',
      'Hormone Panel Testing',
      'InBody / Bioelectrical Impedance Analysis',
      'Lactate Threshold Testing',             // moved from Performance — it's a diagnostic test
      'Live Blood Analysis',
      'Metabolic Blood Panel',
      'Microbiome Analysis',
      'Nutrigenomic Testing',
      'PNOE Metabolic Testing',
      'Postural Assessment',                   // moved from Performance — it's an assessment
      'Resting Metabolic Rate (RMR) Testing',
      'Thermography',
      'Toxicity / Heavy Metal Testing',
      'Visceral Fat Analysis',
      'VO2 Max Testing',
      'Wearable Integration & Analysis',
      // Removed: InBody Composition Analysis (duplicate of InBody / Bioelectrical Impedance Analysis)
    ],
  },
  {
    name: 'Performance & Fitness',
    modalities: [
      'ARX Adaptive Resistance Training',
      'Blood Flow Restriction Training (BFR)',
      'Carol Bike HIIT Training',
      'High Intensity Interval Training (HIIT)',
      'Muscle Activation Techniques (MAT)',
      'Personal Training',
      'Pilates',
      'Power Plate Training',
      'Strength & Conditioning',
      'Suspension Training (TRX)',
      'Vasper System Training',
      'Yoga',
      // Removed: Exercise Physiology Consultation (moved to Diagnostics)
      // Removed: InBody Composition Analysis (duplicate)
      // Removed: Lactate Threshold Testing (moved to Diagnostics)
      // Removed: Physical Therapy (moved to Recovery & Bodywork)
      // Removed: Postural Assessment (moved to Diagnostics)
    ],
  },
];

// Flat deduplicated list (for buildInitialSelections, deriveModalities, drillPanels filter)
const TOP_MODALITIES = [...new Set(CATEGORIES.flatMap(c => c.modalities))];

// ── Synonym map (alternative names → canonical modality name) ─────────────────
const SYNONYMS = {
  // ── Renamed canonicals ──
  'Hyperbaric':                       'Hyperbaric Oxygen (HBOT)',
  'HBO':                              'Hyperbaric Oxygen (HBOT)',
  'Hyperbaric Oxygen':                'Hyperbaric Oxygen (HBOT)',
  'Sensory Deprivation':              'Float Tank / Sensory Deprivation',
  'Flotation':                        'Float Tank / Sensory Deprivation',
  'Float Tank':                       'Float Tank / Sensory Deprivation',
  'Far Infrared':                     'Infrared Sauna',
  'FIR':                              'Infrared Sauna',
  'Sauna':                            'Infrared Sauna',
  'BrainTap / Neurostimulation':      'BrainTap',
  'Neurostimulation':                 'BrainTap',
  // ── Light & Photobiomodulation ──
  'LLLT':                             'Low Level Laser Therapy (LLLT)',
  'Cold Laser':                       'Low Level Laser Therapy (LLLT)',
  'Photobiomodulation':               'Red Light Therapy',
  'PBM':                              'Red Light Therapy',
  'Vielight':                         'Transcranial Photobiomodulation',
  // ── Temperature ──
  'Whole Body Cryotherapy':           'Cryotherapy',
  'WBC':                              'Cryotherapy',
  // ── Oxygen & Ozone ──
  'EBOO':                             'EBOO (Extracorporeal Blood Ozonation & Oxygenation)',
  'Extracorporeal Blood Ozonation':   'EBOO (Extracorporeal Blood Ozonation & Oxygenation)',
  'Blood Ozone':                      'EBOO (Extracorporeal Blood Ozonation & Oxygenation)',
  'EWOT':                             'EWOT (Exercise with Oxygen Therapy)',
  'Exercise with Oxygen':             'EWOT (Exercise with Oxygen Therapy)',
  'LiveO2':                           'EWOT (Exercise with Oxygen Therapy)',
  'HOCATT':                           'HOCATT Therapy',
  'Hydrogen':                         'Molecular Hydrogen Therapy',
  // ── Frequency & Energy ──
  'PEMF':                             'PEMF Therapy',
  'Rife':                             'Rife Machine / Rife Therapy',
  'Apollo':                           'Apollo Neuro (Vagus Nerve Stimulation)',
  'Vagus nerve':                      'Vagus Nerve Stimulation',
  'WBV':                              'Whole Body Vibration Therapy',
  'Vibration Plate':                  'Whole Body Vibration Therapy',
  'Power Plate':                      'Whole Body Vibration Therapy',
  'RASHA':                            'RASHA',
  // ── Infusion & Injection ──
  'Exosomes':                         'Exosome Therapy',
  'Platelet Rich Plasma':             'PRP Therapy',
  'Cold Plasma':                      'Plasma Therapy',
  // ── Recovery & Bodywork ──
  'Myofascial Release':               'Body Rolling / Myofascial Release',
  'Pneumatic Compression':            'Compression Therapy',
  'Normatec':                         'Compression Therapy',
  'NormaTec':                         'Compression Therapy',
  // ── Mind & Neurology ──
  'HRV':                              'Heart Rate Variability (HRV) Training',
  'qEEG':                             'EEG Brain Mapping / qEEG',
  'Brain mapping':                    'EEG Brain Mapping / qEEG',
  'TMS':                              'Transcranial Magnetic Stimulation (TMS)',
  'tDCS':                             'Transcranial Direct Current Stimulation (tDCS)',
  // ── Traditional & Holistic ──
  'Reiki':                            'Energy Healing / Reiki',
  'Functional medicine':              'Functional Medicine Consultation',
  'Naturopath':                       'Naturopathic Medicine',
  'TCM':                              'Traditional Chinese Medicine (TCM)',
  'Colonics':                         'Colon Hydrotherapy',
  'Colonic Irrigation':               'Colon Hydrotherapy',
  // ── Diagnostics & Testing ──
  'PNOE':                             'PNOE Metabolic Testing',
  'VO2':                              'VO2 Max Testing',
  'VO2max':                           'VO2 Max Testing',
  'RMR':                              'Resting Metabolic Rate (RMR) Testing',
  'DEXA':                             'DEXA Scan',
  'Dexa scan':                        'DEXA Scan',
  'Body composition scan':            'DEXA Scan',
  'CGM':                              'Continuous Glucose Monitor (CGM) Consultation',
  'Genetic test':                     'DNA / Genetic Testing',
  'Microbiome test':                  'Gut Microbiome Testing',
  'Food sensitivity':                 'Food Sensitivity Testing',
  'Heavy metals':                     'Toxicity / Heavy Metal Testing',
  'NanoVi':                           'NanoVi',
  // ── Performance & Fitness ──
  'BFR':                              'Blood Flow Restriction Training (BFR)',
  'ARX':                              'ARX Adaptive Resistance Training',
  'Vasper':                           'Vasper System Training',
  'Carol bike':                       'Carol Bike HIIT Training',
  // ── Compound synonyms (used in peptide resolution) ──
  'NAD':                              'NAD+ IV',
  'BPC157':                           'BPC-157',
  'TB500':                            'TB-500',
};

// ── Drill-down config ────────────────────────────────────────────────────────
// typesAreDevices: type selections ARE the devices (stored as 'device' category)
// individualBrands: each selected type gets its own independent brand section
// noDevice: skip the brand/device follow-up question entirely
const DRILL_CONFIG = {
  // ── Light & Photobiomodulation ──────────────────────────────────────────────
  'Red Light Therapy': {
    typeQuestion: 'What type?',
    individualBrands: true,
    types: [
      { label: 'Red Light Bed',           brands: ['NovoTHOR Whole Body Pod', 'TheraLight 360', 'Luminas Red Light Bed'] },
      { label: 'Full Body Panel',         brands: ['Joovv Grand 3.0', 'Platinum LED BioMax Series'] },
      { label: 'Single Panel / Targeted', brands: ['Joovv Solo 3.0', 'BioMax 900', 'BioMax 300', 'Celluma Pro', 'Mito Red Light Panel'] },
    ],
  },
  'Low Level Laser Therapy (LLLT)': {
    typeQuestion: 'What type?',
    types: [
      { label: 'Cold Laser',      brands: ['Erchonia', 'Multi Radiance'] },
      { label: 'Class IV Laser',  brands: ['Erchonia'] },
      { label: 'Handheld Device', brands: ['Erchonia', 'Multi Radiance'] },
    ],
  },
  'Transcranial Photobiomodulation': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'Vielight Neuro Alpha', brands: [] },
      { label: 'Vielight Neuro Gamma', brands: [] },
      { label: 'Neuronic',             brands: [] },
    ],
  },
  // ── Temperature Therapies ───────────────────────────────────────────────────
  'Cold Plunge': {
    typeQuestion: 'What type?',
    individualBrands: true,
    types: [
      { label: 'Single Person', brands: ['Morozko Forge', 'Plunge Pro', 'Blue Cube'] },
      { label: 'Group Plunge',  brands: ['Morozko Forge'] },
      { label: 'Ice Bath',      brands: [] },
    ],
  },
  'Contrast Therapy': {
    typeQuestion: 'What protocol?',
    noDevice: true,
    types: [
      { label: 'Sauna + Cold Plunge',   brands: [] },
      { label: 'Hot Tub + Cold Plunge', brands: [] },
      { label: 'Sauna + Ice Bath',      brands: [] },
      { label: 'Custom Protocol',       brands: [] },
    ],
  },
  'Cryotherapy': {
    typeQuestion: 'What type?',
    individualBrands: true,
    types: [
      { label: 'Whole Body Cryotherapy', brands: ['CryoStar Chamber', 'Impact Cryotherapy'] },
      { label: 'Localized Cryotherapy',  brands: [] },
      { label: 'Cryofacial',             brands: [] },
    ],
  },
  'Full Spectrum Infrared Sauna': {
    typeQuestion: 'What size?',
    individualBrands: true,
    types: [
      { label: '1-Person',           brands: ['Clearlight Sanctuary Series', 'Sunlighten mPulse', 'Sunlighten Solo'] },
      { label: '2-Person',           brands: ['Clearlight Sanctuary Series', 'Sunlighten mPulse', 'Sunlighten Solo'] },
      { label: '3–4 Person',         brands: ['Clearlight Sanctuary Series', 'Sunlighten mPulse'] },
      { label: '4–6 Person',         brands: ['Clearlight Sanctuary Series'] },
      { label: 'Group / Commercial', brands: ['Clearlight Sanctuary Series'] },
    ],
  },
  'Infrared Sauna': {
    typeQuestion: 'What size?',
    individualBrands: true,
    types: [
      { label: '1-Person',           brands: ['Clearlight Sanctuary Series', 'Sunlighten mPulse', 'Sunlighten Solo'] },
      { label: '2-Person',           brands: ['Clearlight Sanctuary Series', 'Sunlighten mPulse', 'Sunlighten Solo'] },
      { label: '3–4 Person',         brands: ['Clearlight Sanctuary Series', 'Sunlighten mPulse'] },
      { label: '4–6 Person',         brands: ['Clearlight Sanctuary Series'] },
      { label: 'Group / Commercial', brands: ['Clearlight Sanctuary Series'] },
    ],
  },
  'Near Infrared Sauna': {
    typeQuestion: 'What size?',
    individualBrands: true,
    types: [
      { label: '1-Person',   brands: [] },
      { label: '2-Person',   brands: [] },
      { label: '3–4 Person', brands: [] },
    ],
  },
  'Traditional Finnish Sauna': {
    typeQuestion: 'What size?',
    individualBrands: true,
    types: [
      { label: '1-Person',           brands: ['Finnleo Traditional Sauna', 'Tylo Traditional Sauna', 'Almost Heaven Traditional Sauna'] },
      { label: '2-Person',           brands: ['Finnleo Traditional Sauna', 'Tylo Traditional Sauna', 'Almost Heaven Traditional Sauna'] },
      { label: '3–4 Person',         brands: ['Finnleo Traditional Sauna', 'Tylo Traditional Sauna'] },
      { label: '4–6 Person',         brands: ['Finnleo Traditional Sauna'] },
      { label: 'Group / Commercial', brands: [] },
    ],
  },
  // ── Oxygen & Ozone ──────────────────────────────────────────────────────────
  'EBOO (Extracorporeal Blood Ozonation & Oxygenation)': {
    typeQuestion: 'What type of session?',
    noDevice: true,
    types: [
      { label: 'Single Pass', brands: [] },
      { label: 'Multi Pass',  brands: [] },
    ],
  },
  'EWOT (Exercise with Oxygen Therapy)': {
    typeQuestion: 'What system do you use?',
    typesAreDevices: true,
    types: [
      { label: 'LiveO2',  brands: [] },
      { label: 'Maxx O2', brands: [] },
    ],
  },
  'Hyperbaric Oxygen (HBOT)': {
    typeQuestion: 'What type of chamber?',
    types: [
      { label: 'Hard Shell Chamber', brands: [] },
      { label: 'Soft Shell Chamber', brands: [] },
    ],
    ataQuestion: 'What ATA level does this chamber reach?',
    ataLevels: ['1.3 ATA', '1.5 ATA', '2.0 ATA', '2.4 ATA', '3.0 ATA'],
    individualAta: true,
  },
  'Ozone Therapy': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Major Autohemotherapy (MAH)', brands: [] },
      { label: 'Minor Autohemotherapy',       brands: [] },
      { label: 'Rectal Insufflation',         brands: [] },
      { label: 'Ozone Sauna',                 brands: [] },
      { label: 'Topical Ozone',               brands: [] },
    ],
  },
  // ── Frequency & Energy ──────────────────────────────────────────────────────
  'BrainTap': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'BrainTap Headset', brands: [] },
      { label: 'Other Device',     brands: [] },
    ],
  },
  'PEMF Therapy': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'Pulse PEMF XL Pro', brands: [] },
      { label: 'Pulse PEMF X1',     brands: [] },
      { label: 'Omnipemf',          brands: [] },
      { label: 'Bemer',             brands: [] },
    ],
    attachmentsQuestion: 'What attachments do you have?',
    attachments: ['Full Body Mat', 'Localized Pad', 'PEMF Ring / Coil', 'PEMF Pillow / Cushion'],
  },
  'RASHA': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'RASHA Device', brands: [] },
    ],
  },
  'Whole Body Vibration Therapy': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'Power Plate', brands: [] },
      { label: 'Lifepro',     brands: [] },
      { label: 'Hypervibe',   brands: [] },
    ],
  },
  // ── Infusion & Injection ────────────────────────────────────────────────────
  'Chelation Therapy': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'IV Chelation (EDTA)',   brands: [] },
      { label: 'Oral Chelation',        brands: [] },
      { label: 'Heavy Metal Chelation', brands: [] },
    ],
  },
  'Exosome Therapy': {
    typeQuestion: 'How is it administered?',
    noDevice: true,
    types: [
      { label: 'IV Infusion', brands: [] },
      { label: 'Injection',   brands: [] },
      { label: 'Topical',     brands: [] },
    ],
  },
  'Plasma Therapy': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'PRP (Platelet Rich Plasma)', brands: [] },
      { label: 'Exosome Enhanced PRP',       brands: [] },
      { label: 'Cold Plasma Therapy',        brands: [] },
    ],
  },
  'PRP Therapy': {
    typeQuestion: 'What application?',
    noDevice: true,
    types: [
      { label: 'Joint Injection', brands: [] },
      { label: 'Facial',          brands: [] },
      { label: 'Aesthetic',       brands: [] },
      { label: 'Scalp',           brands: [] },
      { label: 'Full Body',       brands: [] },
    ],
  },
  'Stem Cell Therapy': {
    typeQuestion: 'How is it administered?',
    noDevice: true,
    types: [
      { label: 'IV Infusion', brands: [] },
      { label: 'Injection',   brands: [] },
      { label: 'Topical',     brands: [] },
    ],
  },
  // ── Recovery & Bodywork ─────────────────────────────────────────────────────
  'Compression Therapy': {
    typeQuestion: 'What device?',
    typesAreDevices: true,
    types: [
      { label: 'NormaTec',     brands: [] },
      { label: 'Rapid Reboot', brands: [] },
      { label: 'Air Relax',    brands: [] },
    ],
    attachmentsQuestion: 'What attachments do you have?',
    attachments: ['Legs', 'Arms / Upper Body', 'Hips / Glutes', 'Full Body Suit'],
  },
  'Float Tank / Sensory Deprivation': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Pod',           brands: [] },
      { label: 'Enclosed Tank', brands: [] },
      { label: 'Open Pool',     brands: [] },
      { label: 'Cabin Style',   brands: [] },
    ],
  },
  'Lymphatic Drainage': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Manual Lymphatic Drainage', brands: [] },
      { label: 'Machine Assisted',          brands: [] },
      { label: 'Pressotherapy',             brands: [] },
    ],
  },
  'Massage Therapy': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Swedish',                    brands: [] },
      { label: 'Deep Tissue',                brands: [] },
      { label: 'Sports Massage',             brands: [] },
      { label: 'Thai Massage',               brands: [] },
      { label: 'Lymphatic Drainage Massage', brands: [] },
    ],
  },
  'Stretch Therapy': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Assisted Stretching', brands: [] },
      { label: 'PNF Stretching',      brands: [] },
      { label: 'Thai Yoga Stretch',   brands: [] },
    ],
  },
  // ── Mind & Neurology ────────────────────────────────────────────────────────
  'Breathwork': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Box Breathing',         brands: [] },
      { label: 'Holotropic Breathwork', brands: [] },
      { label: 'Oxygen Advantage',      brands: [] },
      { label: 'Wim Hof Method',        brands: [] },
      { label: 'Other',                 brands: [] },
    ],
  },
  'Halotherapy / Salt Therapy': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Salt Cave',     brands: [] },
      { label: 'Salt Room',     brands: [] },
      { label: 'Halogenerator', brands: [] },
    ],
  },
  'Heart Rate Variability (HRV) Training': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'HeartMath',    brands: [] },
      { label: 'Polar H10',    brands: [] },
      { label: 'Other Device', brands: [] },
    ],
  },
  'Neurofeedback': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'BrainCore',   brands: [] },
      { label: 'LENS',        brands: [] },
      { label: 'NeurOptimal', brands: [] },
      { label: 'NeuroPeak',   brands: [] },
      { label: 'qEEG Based',  brands: [] },
      { label: 'Other',       brands: [] },
    ],
  },
  'Sound Healing': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Binaural Beats', brands: [] },
      { label: 'Singing Bowls',  brands: [] },
      { label: 'Sound Bath',     brands: [] },
      { label: 'Tuning Forks',   brands: [] },
      { label: 'Other',          brands: [] },
    ],
  },
  // ── Traditional & Holistic ──────────────────────────────────────────────────
  'Acupuncture': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Traditional Chinese Acupuncture', brands: [] },
      { label: 'Dry Needling',                    brands: [] },
      { label: 'Auricular Acupuncture',           brands: [] },
      { label: 'Cosmetic Acupuncture',            brands: [] },
    ],
  },
  'Chiropractic': {
    typeQuestion: 'What type?',
    noDevice: true,
    types: [
      { label: 'Traditional Chiropractic', brands: [] },
      { label: 'Network Spinal',           brands: [] },
      { label: 'Applied Kinesiology',      brands: [] },
      { label: 'Activator Method',         brands: [] },
    ],
  },
  'Colon Hydrotherapy': {
    typeQuestion: 'What method?',
    noDevice: true,
    types: [
      { label: 'Open System',   brands: [] },
      { label: 'Closed System', brands: [] },
    ],
  },
  // ── Diagnostics & Testing ───────────────────────────────────────────────────
  'DEXA Scan': {
    typeQuestion: 'What type of scan?',
    noDevice: true,
    types: [
      { label: 'Body Composition Only', brands: [] },
      { label: 'Bone Density Only',     brands: [] },
      { label: 'Full Scan',             brands: [] },
    ],
  },
  'PNOE Metabolic Testing': {
    typeQuestion: 'What type of assessment?',
    noDevice: true,
    types: [
      { label: 'Resting Metabolic Rate (RMR) Only', brands: [] },
      { label: 'VO2 Max Only',                      brands: [] },
      { label: 'Full Metabolic Assessment',         brands: [] },
    ],
  },
  'VO2 Max Testing': {
    typeQuestion: 'What device?',
    typesAreDevices: true,
    types: [
      { label: 'PNOE Device',    brands: [] },
      { label: 'Metabolic Cart', brands: [] },
      { label: 'Other',          brands: [] },
    ],
  },
  // ── Performance & Fitness ───────────────────────────────────────────────────
  'ARX Adaptive Resistance Training': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'ARX Device', brands: [] },
      { label: 'Other',      brands: [] },
    ],
  },
  'Vasper System Training': {
    typeQuestion: 'What device do you use?',
    typesAreDevices: true,
    types: [
      { label: 'Vasper Device', brands: [] },
      { label: 'Other',         brands: [] },
    ],
  },
  // IV Therapy has no drill-down — handled inline in StepTwo
};

// ── Peptides & Nutrients groups ──────────────────────────────────────────────
const COMPOUND_GROUPS = [
  {
    group: 'Growth & Recovery Peptides',
    items: [
      'BPC-157', 'TB-500', 'Ipamorelin', 'CJC-1295', 'Sermorelin',
      'GHRP-2', 'GHRP-6', 'Hexarelin', 'AOD-9604', 'HGH Fragment 176-191',
      'IGF-1 LR3', 'MGF (Mechano Growth Factor)', 'MK-677 (Ibutamoren)',
    ],
  },
  {
    group: 'Healing & Anti-Aging Peptides',
    items: [
      'GHK-Cu', 'Thymosin Alpha-1', 'Thymosin Beta-4 (TB4)', 'Epithalon',
      'LL-37', 'Kisspeptin', 'SS-31', 'Dihexa', 'KPV', 'VIP (Vasoactive Intestinal Peptide)',
      'DSIP (Delta Sleep-Inducing Peptide)',
    ],
  },
  {
    group: 'Cognitive & Neurological Peptides',
    items: [
      'Selank', 'Semax', 'PT-141 (Bremelanotide)', 'Cerebrolysin', 'Dihexa',
      'Pinealon', 'Cortagen',
    ],
  },
  {
    group: 'Hormone & Optimization',
    items: [
      'Testosterone', 'HGH', 'Semaglutide', 'Tirzepatide', 'DHEA',
      'Pregnenolone', 'HCG', 'MIC Injection', 'Estradiol', 'Progesterone',
      'T3 / T4 Thyroid', 'Melatonin', '5-Amino-1MQ', 'MOTS-c',
    ],
  },
  {
    group: 'IV Nutrients',
    allowSelectAll: true,
    items: [
      'NAD+ IV', 'Glutathione IV', 'Vitamin C (High-Dose) IV', 'Myers Cocktail IV',
      'Alpha Lipoic Acid IV', 'Phosphatidylcholine IV', 'Ozone MAH IV',
      'B12 / B-Complex IV', 'Magnesium IV', 'Zinc IV', 'Selenium IV',
      'Amino Acid IV', 'Biotin IV', 'Coenzyme Q10 IV', 'Chelation (EDTA) IV',
      'Hydrogen Peroxide IV', 'Iron IV', 'Lactated Ringer\'s', 'Ketamine IV',
      'Exosome IV', 'Stem Cell IV', 'Nicotinamide Riboside (NR) IV', 'NMN IV',
    ],
  },
];

// ── Derive flat modalities array from drill-down state ───────────────────────
function deriveModalities(topSelected, drillStates, compounds, customMods, customComps) {
  const result = [];
  const seen = new Set();

  function add(item) {
    const key = `${item.name}|${item.category}`;
    if (!seen.has(key)) { seen.add(key); result.push(item); }
  }

  for (const name of topSelected) {
    add({ name, category: 'modality' });
    const config = DRILL_CONFIG[name];
    const state = drillStates[name];
    if (!config || !state) continue;

    const selectedTypes = state.selectedTypes || [];
    const cat = config.typesAreDevices ? 'device' : 'modality';
    for (const t of selectedTypes) add({ name: t, category: cat });

    if (!config.typesAreDevices) {
      if (config.individualBrands) {
        // Each selected type has its own brand state
        const brandsByType = state.brandsByType || {};
        for (const typeName of selectedTypes) {
          const typeState = brandsByType[typeName] || {};
          if (typeState.brandChoice)         add({ name: typeState.brandChoice,         category: 'device' });
          if (typeState.customBrand?.trim()) add({ name: typeState.customBrand.trim(), category: 'device' });
        }
      } else {
        // Shared brand across all selected types
        if (state.brandChoice)         add({ name: state.brandChoice,         category: 'device' });
        if (state.customBrand?.trim()) add({ name: state.customBrand.trim(), category: 'device' });
      }
    }

    if (config.sizes && state.selectedSize && selectedTypes.length > 0) {
      add({ name: `${state.selectedSize} Sauna`, category: 'modality' });
    }
    if (state.selectedAttachments?.length > 0) {
      for (const att of state.selectedAttachments) add({ name: att, category: 'modality' });
    }
    if (config.individualAta) {
      const ataByType = state.ataByType || {};
      for (const levels of Object.values(ataByType)) {
        for (const level of levels) add({ name: level, category: 'modality' });
      }
    } else if (state.selectedAta?.length > 0) {
      for (const level of state.selectedAta) add({ name: level, category: 'modality' });
    }
  }

  for (const m of customMods)   add(m);
  for (const name of compounds) add({ name, category: 'compound' });
  for (const m of customComps)  add(m);

  return result;
}

function isDrillComplete(name, state) {
  const config = DRILL_CONFIG[name];
  if (!config) return true;
  return (state?.selectedTypes?.length || 0) > 0;
}

// ── Completion score ─────────────────────────────────────────────────────────
function calcScore(form) {
  let score = 0;
  if (form.name.trim())        score += 15;
  if (form.description.trim()) score += 10;
  if (form.address.trim() && form.city.trim() && form.state.trim() && form.zip.trim()) score += 15;
  if (form.phone.trim())       score += 5;
  if (form.website.trim())     score += 5;
  if (form.modalities.some(m => m.category === 'modality'))  score += 15;
  if (form.modalities.some(m => m.category === 'device'))    score += 15;
  if (form.modalities.some(m => m.category === 'compound'))  score += 10;
  if (form.modalities.length >= 5)                           score += 10;
  return Math.min(score, 100);
}

function CompletionIndicator({ form }) {
  const score = calcScore(form);
  const isStrong = score >= 80;
  return (
    <div className={`completion-bar-wrap${isStrong ? ' completion-strong' : ''}`}>
      <div className="completion-top">
        <span className="completion-label">Listing strength</span>
        <span className="completion-pct">{score}%</span>
      </div>
      <div className="completion-track">
        <div className="completion-fill" style={{ width: `${score}%` }} />
      </div>
      {isStrong
        ? <p className="completion-message completion-message-strong">Strong listing — you will show up in more searches</p>
        : <p className="completion-message">Add more offerings to improve your visibility in search results.</p>
      }
    </div>
  );
}

// ── Persistence ──────────────────────────────────────────────────────────────
function saveSubmission(data) {
  const existing = JSON.parse(localStorage.getItem('wd_submissions') || '[]');
  const submission = { ...data, id: crypto.randomUUID(), status: 'pending', created_at: new Date().toISOString() };
  localStorage.setItem('wd_submissions', JSON.stringify([...existing, submission]));
}

// ── AI Website Scanner ───────────────────────────────────────────────────────
// AbortSignal.timeout is not available in Safari — use AbortController instead
function timedSignal(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

async function fetchViaProxy(url) {
  const proxies = [
    {
      fetch: () => fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { signal: timedSignal(12000) }),
      parse: (res) => res.text(),
    },
    {
      fetch: () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, { signal: timedSignal(12000) }),
      parse: (res) => res.text(),
    },
    {
      fetch: () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: timedSignal(12000) }),
      parse: async (res) => { const d = await res.json(); return d.contents || ''; },
    },
  ];

  for (const proxy of proxies) {
    try {
      const res = await proxy.fetch();
      if (!res.ok) continue;
      const html = await proxy.parse(res);
      if (html && html.length > 200) return html;
    } catch {
      // try next
    }
  }
  throw new Error('Could not fetch the website — the site may be blocking automated access');
}

async function callClaude(apiKey, userMessage) {
  const systemPrompt = `You are a wellness business analyzer. Extract all wellness modalities, therapy types, specific devices, equipment brands and models, peptides, compounds, and nutrients mentioned on this webpage. Return ONLY valid JSON with no extra text, using this exact format: { "modalities": [], "devices": [], "peptides": [], "followUpNeeded": [] } where followUpNeeded is an array of objects like { "modality": "IV Therapy", "question": "Which peptides and nutrients do you carry?", "type": "peptides" } or { "modality": "Sauna", "question": "Is it infrared or traditional? What brand?", "type": "sauna" }. Only include followUpNeeded items for modalities where more specificity is needed but was not found on the page. Be specific — distinguish between infrared sauna and traditional sauna, red light beds vs panels.`;

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal: timedSignal(30000),
  });

  if (!aiRes.ok) {
    const errData = await aiRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Anthropic API error ${aiRes.status}`);
  }

  const aiData = await aiRes.json();
  const text = aiData.content?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse AI response');
  return JSON.parse(jsonMatch[0]);
}

async function scanWebsite(url) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Add VITE_ANTHROPIC_API_KEY to .env.local');

  // Try to fetch page content; fall back to URL-only scan if all proxies fail
  let pageText = '';
  try {
    const html = await fetchViaProxy(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,noscript,svg,nav,footer').forEach(el => el.remove());
    pageText = (doc.body?.innerText || doc.body?.textContent || '')
      .replace(/\s+/g, ' ').trim().slice(0, 5000);
  } catch {
    // All proxies failed — proceed with URL-only scan
  }

  const userMessage = pageText && pageText.length >= 40
    ? `Analyze this wellness business website content and extract all offerings:\n\n${pageText}`
    : `Based on this wellness business URL, identify likely wellness offerings they provide. Make reasonable inferences from the domain name and any context. URL: ${url}`;

  return callClaude(apiKey, userMessage);
}

// ── Map scan result → form state ─────────────────────────────────────────────
function buildInitialSelections(scanResult) {
  const topSelected = new Set();
  const drillStates = {};
  const compounds   = new Set();
  const allItems    = COMPOUND_GROUPS.flatMap(g => g.items);

  // Apply synonym map (case-insensitive exact key match)
  function resolveSynonym(name) {
    const lower = name.toLowerCase().trim();
    for (const [syn, canonical] of Object.entries(SYNONYMS)) {
      if (lower === syn.toLowerCase()) return canonical;
    }
    return name;
  }

  // STRICT modality match: synonym first, then exact case-insensitive match only.
  // No partial/fuzzy fallback — if it's not in SYNONYMS or exactly in TOP_MODALITIES, it is rejected.
  function findModality(raw) {
    const resolved = resolveSynonym(raw);
    const lower    = resolved.toLowerCase().trim();
    return TOP_MODALITIES.find(m => m.toLowerCase() === lower) || null;
  }

  // STRICT compound match: synonym → exact match, then narrow contains check.
  function findCompound(raw) {
    const resolved = resolveSynonym(raw);
    const lower    = resolved.toLowerCase().trim();
    const exact    = allItems.find(item => item.toLowerCase() === lower);
    if (exact) return exact;
    if (lower.length >= 4) {
      const partial = allItems.find(item => item.toLowerCase().includes(lower));
      if (partial) return partial;
    }
    return null;
  }

  // Strict device/type match: exact or canonical-contains-term only
  function matchesLabel(label, raw) {
    const resolved = resolveSynonym(raw).toLowerCase().trim();
    const ll = label.toLowerCase();
    return ll === resolved || ll.includes(resolved);
  }

  // ── Map modalities (strict) ──
  for (const found of (scanResult.modalities || [])) {
    const match = findModality(found);
    if (match) topSelected.add(match);
  }

  // ── Map devices → DRILL_CONFIG types/brands (strict) ──
  for (const found of (scanResult.devices || [])) {
    for (const [mName, config] of Object.entries(DRILL_CONFIG)) {
      for (const type of (config.types || [])) {
        const typeHit  = matchesLabel(type.label, found);
        const brandHit = (type.brands || []).find(b => matchesLabel(b, found));
        if (!typeHit && !brandHit) continue;

        topSelected.add(mName);
        if (!drillStates[mName])
          drillStates[mName] = { selectedTypes: [], brandsByType: {}, ataByType: {} };

        if (!drillStates[mName].selectedTypes.includes(type.label)) {
          drillStates[mName].selectedTypes.push(type.label);
          if (config.individualBrands)
            drillStates[mName].brandsByType[type.label] = {
              brandChoice: brandHit || null, brandSkipped: false, customBrand: '',
            };
          if (config.individualAta)
            drillStates[mName].ataByType[type.label] = [];
        }
      }
    }
  }

  // ── Map peptides (strict) ──
  for (const found of (scanResult.peptides || [])) {
    const match = findCompound(found);
    if (match) compounds.add(match);
  }

  return { topSelected, drillStates, compounds };
}

// ── Shared UI atoms ──────────────────────────────────────────────────────────
function CustomInput({ placeholder, onAdd }) {
  const [val, setVal] = useState('');
  function add() {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal('');
  }
  return (
    <div className="custom-tag-row">
      <input
        className="field-input custom-tag-input"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
      />
      <button className="btn-add" onClick={add} type="button">Add</button>
    </div>
  );
}

// ── Drill panel ──────────────────────────────────────────────────────────────
function DrillPanel({ modalityName, config, state, onUpdate }) {
  const { typeQuestion, typesAreDevices, types, sizeQuestion, sizes, individualBrands,
          attachmentsQuestion, attachments, ataQuestion, ataLevels, individualAta,
          noDevice } = config;
  const curState = state || {};
  const selectedTypes = curState.selectedTypes || [];
  const brandsByType = curState.brandsByType || {};
  const ataByType = curState.ataByType || {};

  function toggleType(label) {
    const next = selectedTypes.includes(label)
      ? selectedTypes.filter(t => t !== label)
      : [...selectedTypes, label];
    // Carry forward per-type brand state
    const newBrandsByType = {};
    for (const t of next) {
      newBrandsByType[t] = brandsByType[t] || { brandChoice: null, brandSkipped: false, customBrand: '' };
    }
    // Carry forward per-type ATA state
    const newAtaByType = {};
    for (const t of next) {
      newAtaByType[t] = ataByType[t] || [];
    }
    onUpdate({ ...curState, selectedTypes: next, brandsByType: newBrandsByType, ataByType: newAtaByType, selectedSize: null });
  }

  function updateTypeBrand(typeName, patch) {
    const newBrandsByType = {
      ...brandsByType,
      [typeName]: { ...(brandsByType[typeName] || {}), ...patch },
    };
    onUpdate({ ...curState, brandsByType: newBrandsByType });
  }

  // Shared brand helpers (used when individualBrands is false)
  function selectBrand(brand) {
    onUpdate({ ...curState, brandChoice: brand === curState.brandChoice ? null : brand, brandSkipped: false });
  }
  function skipBrand() {
    onUpdate({ ...curState, brandChoice: null, brandSkipped: true, customBrand: '' });
  }
  function addCustomBrand(val) {
    onUpdate({ ...curState, customBrand: val, brandChoice: null, brandSkipped: false });
  }

  const showSizeQ = !!sizes && selectedTypes.length > 0;

  return (
    <div className="drill-panel">
      <div className="drill-panel-inner">
        <div className="drill-header">
          <div className="drill-modality-badge">{modalityName}</div>
          {selectedTypes.length > 0 && (
            <span className="drill-select-hint">{selectedTypes.length} selected — pick all that apply</span>
          )}
        </div>

        <p className="drill-question">{typeQuestion}</p>
        <div className="drill-chips">
          {types.map(t => {
            const isOn = selectedTypes.includes(t.label);
            return (
              <button
                key={t.label}
                className={`drill-chip${isOn ? ' selected' : ''}`}
                onClick={() => toggleType(t.label)}
                type="button"
              >
                {isOn && <span className="drill-chip-check">✓</span>}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Size sub-question (Sauna) */}
        {showSizeQ && (
          <div className="drill-brand-section">
            <p className="drill-question">{sizeQuestion}</p>
            <div className="drill-chips">
              {sizes.map(size => {
                const isOn = curState.selectedSize === size;
                return (
                  <button
                    key={size}
                    className={`drill-chip${isOn ? ' selected' : ''}`}
                    onClick={() => onUpdate({ ...curState, selectedSize: isOn ? null : size })}
                    type="button"
                  >
                    {isOn && <span className="drill-chip-check">✓</span>}
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-type brand sections (individualBrands) */}
        {individualBrands && selectedTypes.map(typeName => {
          const typeConfig = types.find(t => t.label === typeName);
          if (!typeConfig) return null;
          const typeBrands = typeConfig.brands || [];
          const typeState = brandsByType[typeName] || {};

          return (
            <div key={typeName} className="drill-brand-section">
              <div className="drill-type-brand-header">{typeName}</div>
              {typeBrands.length > 0 && (
                <div className="drill-chips">
                  {typeBrands.map(brand => (
                    <button
                      key={brand}
                      className={`drill-chip drill-chip-brand${typeState.brandChoice === brand ? ' selected' : ''}`}
                      onClick={() => updateTypeBrand(typeName, {
                        brandChoice: brand === typeState.brandChoice ? null : brand,
                        brandSkipped: false,
                      })}
                      type="button"
                    >
                      {typeState.brandChoice === brand && <span className="drill-chip-check">✓</span>}
                      {brand}
                    </button>
                  ))}
                </div>
              )}
              <CustomInput
                placeholder="My brand isn't listed — add it manually"
                onAdd={(val) => updateTypeBrand(typeName, { customBrand: val, brandChoice: null, brandSkipped: false })}
              />
              {typeState.customBrand && (
                <div className="drill-custom-set">Added: <strong>{typeState.customBrand}</strong></div>
              )}
              <button
                className={`drill-skip-btn${typeState.brandSkipped ? ' skipped' : ''}`}
                onClick={() => updateTypeBrand(typeName, { brandChoice: null, brandSkipped: true, customBrand: '' })}
                type="button"
              >
                {typeState.brandSkipped ? '✓ Skipped — listing type only' : "Skip — I'll just list the type"}
              </button>
            </div>
          );
        })}

        {/* Attachments (Compression Therapy, PEMF) */}
        {attachments && selectedTypes.length > 0 && (
          <div className="drill-brand-section">
            <p className="drill-question">{attachmentsQuestion}</p>
            <div className="drill-chips">
              {attachments.map(att => {
                const isOn = (curState.selectedAttachments || []).includes(att);
                return (
                  <button
                    key={att}
                    className={`drill-chip${isOn ? ' selected' : ''}`}
                    onClick={() => {
                      const cur = curState.selectedAttachments || [];
                      const next = isOn ? cur.filter(a => a !== att) : [...cur, att];
                      onUpdate({ ...curState, selectedAttachments: next });
                    }}
                    type="button"
                  >
                    {isOn && <span className="drill-chip-check">✓</span>}
                    {att}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ATA level — per-type (Hyperbaric with individualAta) */}
        {ataLevels && individualAta && selectedTypes.map(typeName => (
          <div key={typeName} className="drill-brand-section">
            <div className="drill-type-brand-header">{typeName}</div>
            <p className="drill-question">{ataQuestion}</p>
            <div className="drill-chips">
              {ataLevels.map(level => {
                const isOn = (ataByType[typeName] || []).includes(level);
                return (
                  <button
                    key={level}
                    className={`drill-chip${isOn ? ' selected' : ''}`}
                    onClick={() => {
                      const cur = ataByType[typeName] || [];
                      const next = isOn ? cur.filter(a => a !== level) : [...cur, level];
                      onUpdate({ ...curState, ataByType: { ...ataByType, [typeName]: next } });
                    }}
                    type="button"
                  >
                    {isOn && <span className="drill-chip-check">✓</span>}
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ATA level — shared (non-individual) */}
        {ataLevels && !individualAta && selectedTypes.length > 0 && (
          <div className="drill-brand-section">
            <p className="drill-question">{ataQuestion}</p>
            <div className="drill-chips">
              {ataLevels.map(level => {
                const isOn = (curState.selectedAta || []).includes(level);
                return (
                  <button
                    key={level}
                    className={`drill-chip${isOn ? ' selected' : ''}`}
                    onClick={() => {
                      const cur = curState.selectedAta || [];
                      const next = isOn ? cur.filter(a => a !== level) : [...cur, level];
                      onUpdate({ ...curState, selectedAta: next });
                    }}
                    type="button"
                  >
                    {isOn && <span className="drill-chip-check">✓</span>}
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shared brand section (non-individual, non-device, brand question enabled) */}
        {!noDevice && !individualBrands && !typesAreDevices && selectedTypes.length > 0 && (() => {
          const allBrands = [...new Set(
            selectedTypes.flatMap(typeName => types.find(t => t.label === typeName)?.brands || [])
          )];
          const showBrandQ = allBrands.length > 0 || !curState.brandSkipped;
          if (!showBrandQ) return null;
          return (
            <div className="drill-brand-section">
              <p className="drill-question">What brand / model?</p>
              {allBrands.length > 0 && (
                <div className="drill-chips">
                  {allBrands.map(brand => (
                    <button
                      key={brand}
                      className={`drill-chip drill-chip-brand${curState.brandChoice === brand ? ' selected' : ''}`}
                      onClick={() => selectBrand(brand)}
                      type="button"
                    >
                      {curState.brandChoice === brand && <span className="drill-chip-check">✓</span>}
                      {brand}
                    </button>
                  ))}
                </div>
              )}
              <CustomInput placeholder="My brand isn't listed — add it manually" onAdd={addCustomBrand} />
              {curState.customBrand && (
                <div className="drill-custom-set">Added: <strong>{curState.customBrand}</strong></div>
              )}
              <button
                className={`drill-skip-btn${curState.brandSkipped ? ' skipped' : ''}`}
                onClick={skipBrand}
                type="button"
              >
                {curState.brandSkipped ? '✓ Skipped — listing type only' : "Skip — I'll just list the type"}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Step 1: Business Info ────────────────────────────────────────────────────
function StepOne({ form, onChange, onNext, onScanComplete }) {
  const [errors, setErrors]         = useState({});
  const [scanStatus, setScanStatus] = useState('idle'); // idle | scanning | done | failed
  const [scanError, setScanError]   = useState('');

  async function handleScan() {
    const url = form.website.trim();
    if (!url) return;
    setScanStatus('scanning');
    setScanError('');
    try {
      const result = await scanWebsite(url);
      onScanComplete(result);
      setScanStatus('done');
    } catch (err) {
      setScanError(err.message || 'Scan failed');
      setScanStatus('failed');
      onScanComplete(null);
    }
  }

  function validate() {
    const e = {};
    if (!form.name.trim())        e.name        = 'Business name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.address.trim())     e.address     = 'Address is required';
    if (!form.city.trim())        e.city        = 'City is required';
    if (!form.state.trim())       e.state       = 'State is required';
    if (!form.zip.trim())         e.zip         = 'ZIP code is required';
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  }

  return (
    <div className="step-body">
      <div className="field">
        <label className="field-label">Business Name *</label>
        <input className={`field-input${errors.name ? ' error' : ''}`} value={form.name}
          onChange={(e) => onChange('name', e.target.value)} placeholder="e.g. Optimal You Wellness" />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="field">
        <label className="field-label">Short Description *</label>
        <textarea className={`field-input field-textarea${errors.description ? ' error' : ''}`}
          value={form.description} onChange={(e) => onChange('description', e.target.value)}
          placeholder="Briefly describe your business and what makes it unique…" rows={3} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="field">
        <label className="field-label">Street Address *</label>
        <input className={`field-input${errors.address ? ' error' : ''}`} value={form.address}
          onChange={(e) => onChange('address', e.target.value)} placeholder="123 Wellness Ave" />
        {errors.address && <span className="field-error">{errors.address}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label">City *</label>
          <input className={`field-input${errors.city ? ' error' : ''}`} value={form.city}
            onChange={(e) => onChange('city', e.target.value)} placeholder="Austin" />
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>
        <div className="field field-state">
          <label className="field-label">State *</label>
          <input className={`field-input${errors.state ? ' error' : ''}`} value={form.state}
            onChange={(e) => onChange('state', e.target.value.toUpperCase().slice(0, 2))}
            placeholder="TX" maxLength={2} />
          {errors.state && <span className="field-error">{errors.state}</span>}
        </div>
        <div className="field field-zip">
          <label className="field-label">ZIP *</label>
          <input className={`field-input${errors.zip ? ' error' : ''}`} value={form.zip}
            onChange={(e) => onChange('zip', e.target.value)} placeholder="78704" maxLength={10} />
          {errors.zip && <span className="field-error">{errors.zip}</span>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label">Phone</label>
          <input className="field-input" value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)} placeholder="(512) 555-0000" type="tel" />
        </div>
        <div className="field">
          <label className="field-label">Website</label>
          <input className="field-input" value={form.website}
            onChange={(e) => onChange('website', e.target.value)} placeholder="https://yoursite.com" type="url" />
        </div>
      </div>

      {/* ── Hours ── */}
      <div className="field">
        <label className="field-label">Business Hours <span className="field-optional">(optional)</span></label>
        <p className="field-hint">Leave blank for days you're closed.</p>
        <div className="hours-grid">
          {DAY_KEYS.map(key => (
            <div key={key} className="hours-row">
              <span className="hours-day-label">{DAY_LABELS[key]}</span>
              <input
                className="field-input hours-input"
                value={form.hours?.[key] || ''}
                onChange={(e) => onChange('hours', { ...form.hours, [key]: e.target.value })}
                placeholder="e.g. 9:00 AM – 6:00 PM"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Walk-in policy ── */}
      <div className="field">
        <label className="field-label">Walk-in Policy <span className="field-optional">(optional)</span></label>
        <div className="walkin-options">
          {[
            { value: 'welcome',     label: 'Walk-ins Welcome' },
            { value: 'appointment', label: 'By Appointment Only' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`walkin-option${form.walkIn === opt.value ? ' selected' : ''}`}
              onClick={() => onChange('walkIn', form.walkIn === opt.value ? '' : opt.value)}
            >
              {form.walkIn === opt.value && <span className="walkin-check">✓</span>}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── AI Scan ── */}
      <div className="scan-section">
        {scanStatus === 'idle' && (
          <>
            <button
              className="btn-scan"
              type="button"
              onClick={handleScan}
              disabled={!form.website.trim()}
            >
              ✨ Scan My Website with AI
            </button>
            <p className="scan-helper">
              We'll automatically detect your offerings and save you time
            </p>
          </>
        )}
        {scanStatus === 'scanning' && (
          <div className="scan-loading">
            <div className="scan-spinner" />
            <span>Scanning your website…</span>
          </div>
        )}
        {scanStatus === 'done' && (
          <div className="scan-done">
            <span className="scan-done-icon">✓</span>
            <span>Scan complete — your offerings are pre-filled in the next step.</span>
            <button
              className="scan-redo"
              type="button"
              onClick={() => { setScanStatus('idle'); onScanComplete(null); }}
            >
              Rescan
            </button>
          </div>
        )}
        {scanStatus === 'failed' && (
          <div className="scan-failed">
            <span className="scan-failed-icon">⚠</span>
            <span style={{ flex: 1 }}>
              {scanError || "Couldn't scan your website"}.{' '}
              Select your offerings manually below.
            </span>
            <button
              className="scan-redo"
              type="button"
              onClick={() => setScanStatus('idle')}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn-primary" onClick={handleNext}>Continue →</button>
      </div>
    </div>
  );
}

// ── Follow-up card (AI scan targeted questions) ──────────────────────────────
function FollowUpCard({ item, topSelected, drillStates, compounds, onUpdateDrill, onToggleCompound }) {
  const { modality, question, type } = item;

  if (type === 'peptides') {
    return (
      <div className="followup-card">
        <div className="followup-card-header">
          <span className="followup-pill">{modality}</span>
          <p className="followup-question">{question}</p>
        </div>
        <div className="followup-card-body">
          {COMPOUND_GROUPS.map(({ group, items }) => (
            <div key={group} className="compound-group">
              <div className="compound-group-label followup-group-label">{group}</div>
              <div className="offering-chips">
                {items.map(name => (
                  <button
                    key={name}
                    className={`offering-chip chip-compound${compounds.has(name) ? ' selected' : ''}`}
                    onClick={() => onToggleCompound(name)}
                    type="button"
                  >
                    {compounds.has(name) && <span className="chip-done">✓</span>}
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const config = DRILL_CONFIG[modality];
  if (config && topSelected.has(modality)) {
    return (
      <div className="followup-card">
        <div className="followup-card-header">
          <span className="followup-pill">{modality}</span>
          <p className="followup-question">{question}</p>
        </div>
        <DrillPanel
          modalityName={modality}
          config={config}
          state={drillStates[modality]}
          onUpdate={(s) => onUpdateDrill(modality, s)}
        />
      </div>
    );
  }

  return (
    <div className="followup-card">
      <div className="followup-card-header">
        <span className="followup-pill">{modality}</span>
        <p className="followup-question">{question}</p>
      </div>
    </div>
  );
}

// ── Category group (flat, always visible — matches Peptides & Nutrients style) ─
function CategoryGroup({
  category, topSelected, drillStates, onToggleTop, onUpdateDrill,
  followUpModalityNames, form, onChange, searchQuery,
}) {
  const { name, modalities } = category;

  const q = searchQuery.toLowerCase().trim();
  const displayedModalities = q
    ? modalities.filter(m => m.toLowerCase().includes(q))
    : modalities;

  // Hide entirely when searching with no matches
  if (q && displayedModalities.length === 0) return null;

  // Drill panels for selected modalities in this category (not in follow-up cards)
  const inlineDrills = modalities.filter(
    m => topSelected.has(m) && DRILL_CONFIG[m] && !followUpModalityNames.has(m)
  );

  // IV Therapy special panel lives inside Infusion & Injection
  const showIVPanel = name === 'Infusion & Injection' && topSelected.has('IV Therapy');

  return (
    <div className="cat-group">
      <div className="cat-group-label">{name}</div>
      <div className="offering-chips">
        {displayedModalities.map(modName => {
          const isOn = topSelected.has(modName);
          const hasDrill = !!DRILL_CONFIG[modName];
          const complete = isOn && isDrillComplete(modName, drillStates[modName]);
          return (
            <button
              key={modName}
              className={`offering-chip chip-modality${isOn ? ' selected' : ''}`}
              onClick={() => onToggleTop(modName)}
              type="button"
            >
              {complete && <span className="chip-done">✓</span>}
              {modName}
              {hasDrill && !isOn && <span className="chip-expand-hint">›</span>}
            </button>
          );
        })}
      </div>

      {/* Inline drill panels */}
      {inlineDrills.map(modName => (
        <DrillPanel
          key={modName}
          modalityName={modName}
          config={DRILL_CONFIG[modName]}
          state={drillStates[modName]}
          onUpdate={(s) => onUpdateDrill(modName, s)}
        />
      ))}

      {/* IV Therapy — simple optional text field */}
      {showIVPanel && (
        <div className="drill-panel">
          <div className="drill-panel-inner">
            <div className="drill-header">
              <div className="drill-modality-badge">IV Therapy</div>
            </div>
            <div className="field" style={{ gap: '6px' }}>
              <label className="drill-question">List any additional IV drips you offer (optional)</label>
              <textarea
                className="field-input field-textarea"
                rows={2}
                placeholder="e.g. NAD+ Infusion, High-Dose Vitamin C, Custom Amino Blend…"
                value={form.ivDripsText}
                onChange={(e) => onChange('ivDripsText', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Offerings (drill-down) ───────────────────────────────────────────
function StepTwo({ form, onChange, onNext, onBack, scanResult }) {
  const [topSelected, setTopSelected] = useState(() => {
    if (!scanResult) return new Set();
    return buildInitialSelections(scanResult).topSelected;
  });
  const [drillStates, setDrillStates] = useState(() => {
    if (!scanResult) return {};
    return buildInitialSelections(scanResult).drillStates;
  });
  const [compounds, setCompounds]     = useState(() => {
    if (!scanResult) return new Set();
    return buildInitialSelections(scanResult).compounds;
  });
  const [customMods, setCustomMods]   = useState([]);
  const [customComps, setCustomComps] = useState([]);
  const [error, setError]             = useState('');
  const [modSearch, setModSearch]     = useState('');

  // Sync scan selections into form.modalities after first mount (not during render)
  useEffect(() => {
    if (!scanResult) return;
    const { topSelected: ts, drillStates: ds, compounds: cs } = buildInitialSelections(scanResult);
    onChange('modalities', deriveModalities(ts, ds, cs, [], []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync(ts, ds, cs, cm, cc) {
    onChange('modalities', deriveModalities(ts, ds, cs, cm, cc));
  }

  function toggleTop(name) {
    const next = new Set(topSelected);
    if (next.has(name)) {
      next.delete(name);
      const nd = { ...drillStates };
      delete nd[name];
      setTopSelected(next);
      setDrillStates(nd);
      sync(next, nd, compounds, customMods, customComps);
    } else {
      next.add(name);
      setTopSelected(next);
      sync(next, drillStates, compounds, customMods, customComps);
    }
    setError('');
  }

  function updateDrill(modalityName, newState) {
    const nd = { ...drillStates, [modalityName]: newState };
    setDrillStates(nd);
    sync(topSelected, nd, compounds, customMods, customComps);
  }

  function toggleCompound(name) {
    const next = new Set(compounds);
    next.has(name) ? next.delete(name) : next.add(name);
    setCompounds(next);
    sync(topSelected, drillStates, next, customMods, customComps);
  }

  function addCustomMod(val) {
    const m = { name: val, category: 'modality' };
    const next = [...customMods, m];
    setCustomMods(next);
    sync(topSelected, drillStates, compounds, next, customComps);
  }

  function addCustomComp(val) {
    const m = { name: val, category: 'compound' };
    const next = [...customComps, m];
    setCustomComps(next);
    sync(topSelected, drillStates, compounds, customMods, next);
  }

  function removeTag(item) {
    if (item.category === 'modality') {
      if (topSelected.has(item.name)) { toggleTop(item.name); return; }
      const next = customMods.filter(m => m.name !== item.name);
      setCustomMods(next);
      sync(topSelected, drillStates, compounds, next, customComps);
    } else if (item.category === 'compound') {
      if (compounds.has(item.name)) { toggleCompound(item.name); return; }
      const next = customComps.filter(m => m.name !== item.name);
      setCustomComps(next);
      sync(topSelected, drillStates, compounds, customMods, next);
    }
  }

  function handleNext() {
    if (form.modalities.length === 0) {
      setError('Select at least one offering before continuing.');
      return;
    }
    onNext();
  }

  // Follow-up items from scan (modality-type follow-ups exclude from main drill list)
  // Only show follow-up cards for modalities that passed strict matching
  // (i.e. are actually in topSelected) or peptide follow-ups (always valid)
  const followUpItems = (scanResult?.followUpNeeded || []).filter(f =>
    f.type === 'peptides' || topSelected.has(f.modality)
  );
  const followUpModalityNames = new Set(
    followUpItems.filter(f => f.type !== 'peptides').map(f => f.modality)
  );

  // Count total offerings found by scan
  const scanFoundCount = scanResult
    ? (scanResult.modalities?.length || 0) + (scanResult.devices?.length || 0) + (scanResult.peptides?.length || 0)
    : 0;

  return (
    <div className="step-body">
      <CompletionIndicator form={form} />

      {/* ── Scan result banner ── */}
      {scanResult && scanFoundCount > 0 && (
        <div className="scan-banner">
          <span className="scan-banner-icon">✓</span>
          <span>
            We found <strong>{scanFoundCount} offering{scanFoundCount !== 1 ? 's' : ''}</strong> on your website.
            Review below and add anything we missed.
          </span>
        </div>
      )}

      {/* ── Follow-up cards (targeted AI questions) ── */}
      {followUpItems.length > 0 && (
        <div className="followup-section">
          <p className="followup-section-label">A few quick questions about what we found:</p>
          {followUpItems.map((item) => (
            <FollowUpCard
              key={item.modality + item.type}
              item={item}
              topSelected={topSelected}
              drillStates={drillStates}
              compounds={compounds}
              onUpdateDrill={updateDrill}
              onToggleCompound={toggleCompound}
            />
          ))}
        </div>
      )}

      {error && <div className="step-error-banner">{error}</div>}

      {/* ── Modalities ── */}
      <div className="offering-section">
        <h3 className="offering-label">Modalities</h3>
        <p className="offering-helper">
          Select every therapy you offer. Be specific — clients search for exact treatments.
          The more specific you are, the higher you rank in search results.
        </p>

        {/* Search bar */}
        <div className="cat-search-wrap">
          <svg className="cat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="cat-search"
            placeholder="Search modalities..."
            value={modSearch}
            onChange={e => setModSearch(e.target.value)}
          />
          {modSearch && (
            <button className="cat-search-clear" onClick={() => setModSearch('')} type="button" aria-label="Clear search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapsible category groups with inline drill panels */}
        <div className="cat-groups">
          {CATEGORIES.map(cat => (
            <CategoryGroup
              key={cat.name}
              category={cat}
              topSelected={topSelected}
              drillStates={drillStates}
              onToggleTop={toggleTop}
              onUpdateDrill={updateDrill}
              followUpModalityNames={followUpModalityNames}
              form={form}
              onChange={onChange}
              searchQuery={modSearch}
            />
          ))}
        </div>

        <CustomInput placeholder="Add custom modality…" onAdd={addCustomMod} />
      </div>

      {/* ── Peptides & Nutrients ── */}
      <div className="offering-section">
        <h3 className="offering-label">Peptides & Nutrients</h3>
        <p className="offering-helper">
          List every peptide and nutrient you offer. This is how clients find you.
        </p>

        {COMPOUND_GROUPS.map(({ group, items, allowSelectAll }) => {
          const allSelected = items.every(name => compounds.has(name));
          return (
          <div key={group} className="compound-group">
            <div className="compound-group-header">
              <span className="compound-group-label">{group}</span>
              {allowSelectAll && (
                <button
                  className="select-all-btn"
                  type="button"
                  onClick={() => {
                    const next = new Set(compounds);
                    if (allSelected) {
                      items.forEach(name => next.delete(name));
                    } else {
                      items.forEach(name => next.add(name));
                    }
                    setCompounds(next);
                    sync(topSelected, drillStates, next, customMods, customComps);
                  }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            <div className="offering-chips">
              {items.map(name => (
                <button
                  key={name}
                  className={`offering-chip chip-compound${compounds.has(name) ? ' selected' : ''}`}
                  onClick={() => toggleCompound(name)}
                  type="button"
                >
                  {compounds.has(name) && <span className="chip-done">✓</span>}
                  {name}
                </button>
              ))}
            </div>
          </div>
          );
        })}

        <CustomInput placeholder="Add custom peptide or nutrient…" onAdd={addCustomComp} />
      </div>

      {/* ── Running summary ── */}
      {form.modalities.length > 0 && (
        <div className="selected-summary">
          <span className="selected-summary-label">
            Everything selected ({form.modalities.length}):
          </span>
          <div className="selected-tags">
            {form.modalities.map((m) => (
              <span key={m.name + m.category} className={`card-tag tag-${m.category}`}>
                {m.name}
                <button
                  className="tag-remove"
                  onClick={() => removeTag(m)}
                  aria-label={`Remove ${m.name}`}
                >×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={handleNext}>Review →</button>
      </div>
    </div>
  );
}

// ── Step 3: Review ───────────────────────────────────────────────────────────
function StepThree({ form, onBack, onSubmit, submitting, submitError }) {
  const byCategory = (cat) => form.modalities.filter((m) => m.category === cat);
  return (
    <div className="step-body">
      <CompletionIndicator form={form} />

      <div className="review-card">
        <div className="review-avatar">{form.name.charAt(0)}</div>
        <h3 className="review-name">{form.name}</h3>
        <p className="review-location">{form.address}, {form.city}, {form.state} {form.zip}</p>
        <p className="review-description">{form.description}</p>
        {form.phone   && <p className="review-contact">{form.phone}</p>}
        {form.website && <p className="review-contact">{form.website}</p>}
      </div>

      {byCategory('modality').length > 0 && (
        <div className="review-group">
          <span className="review-group-label">Modalities</span>
          <div className="review-tags">
            {byCategory('modality').map(m => <span key={m.name} className="card-tag tag-modality">{m.name}</span>)}
          </div>
        </div>
      )}
      {byCategory('device').length > 0 && (
        <div className="review-group">
          <span className="review-group-label">Devices</span>
          <div className="review-tags">
            {byCategory('device').map(m => <span key={m.name} className="card-tag tag-device">{m.name}</span>)}
          </div>
        </div>
      )}
      {byCategory('compound').length > 0 && (
        <div className="review-group">
          <span className="review-group-label">Peptides & Nutrients</span>
          <div className="review-tags">
            {byCategory('compound').map(m => <span key={m.name} className="card-tag tag-compound">{m.name}</span>)}
          </div>
        </div>
      )}
      {form.ivDripsText?.trim() && (
        <div className="review-group">
          <span className="review-group-label">Additional IV Drips</span>
          <p className="review-description" style={{ marginTop: 0 }}>{form.ivDripsText}</p>
        </div>
      )}

      <p className="review-note">
        Your listing will be reviewed before it goes live. Most approvals happen within 24–48 hours.
      </p>

      {submitError && <div className="step-error-banner">{submitError}</div>}

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack} disabled={submitting}>← Back</button>
        <button className="btn-primary btn-submit" onClick={onSubmit} disabled={submitting}>
          {submitting ? (
            <span className="btn-spinner-wrap">
              <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Submitting…
            </span>
          ) : 'Submit Listing'}
        </button>
      </div>
    </div>
  );
}

// ── Success ──────────────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="success-screen">
      <div className="success-icon">✓</div>
      <h2>Submission Received!</h2>
      <p>Your listing is under review. We'll approve it within 24 hours.</p>
      <Link to="/" className="btn-primary">Back to Directory</Link>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Submit() {
  const [step, setStep]             = useState(0);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [scanResult, setScanResult] = useState(null);

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      // Generate ID client-side so we don't need to SELECT back the pending row
      // (SELECT policy only allows approved rows, so chaining .select() after insert would fail)
      const bizId = crypto.randomUUID();

      // 1. Insert the business record
      const { error: bizErr } = await supabase
        .from('businesses')
        .insert({
          id:          bizId,
          name:        form.name,
          description: form.description,
          address:     form.address,
          city:        form.city,
          state:       form.state,
          zip:         form.zip,
          phone:       form.phone   || null,
          website:     form.website || null,
          status:      'pending',
        });

      if (bizErr) throw bizErr;

      const biz = { id: bizId };

      // 2. Upsert modalities (get or create by name+category)
      if (form.modalities.length > 0) {
        const uniqueMods = [...new Map(
          form.modalities.map(m => [`${m.name}|${m.category}`, m])
        ).values()];

        const { error: modErr } = await supabase
          .from('modalities')
          .upsert(
            uniqueMods.map(m => ({ name: m.name, category: m.category })),
            { onConflict: 'name,category', ignoreDuplicates: true }
          );
        if (modErr) throw modErr;

        // 3. Fetch back their ids
        const { data: modRows, error: fetchErr } = await supabase
          .from('modalities')
          .select('id, name, category')
          .in('name', uniqueMods.map(m => m.name));
        if (fetchErr) throw fetchErr;

        // Build a name+category → id lookup
        const modMap = {};
        for (const row of modRows) modMap[`${row.name}|${row.category}`] = row.id;

        // 4. Insert business_modalities links
        const links = uniqueMods
          .map(m => ({ business_id: biz.id, modality_id: modMap[`${m.name}|${m.category}`] }))
          .filter(l => l.modality_id != null);

        if (links.length > 0) {
          const { error: linkErr } = await supabase
            .from('business_modalities')
            .insert(links);
          if (linkErr) throw linkErr;
        }
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <main className="submit-page"><SuccessScreen /></main>;

  return (
    <main className="submit-page">
      <div className="submit-container">
        <div className="submit-header">
          <h1>List Your Business</h1>
          <p>Get discovered by people searching for exactly what you offer.</p>
        </div>

        <div className="stepper">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className={`stepper-item${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
              <div className="stepper-dot">{i < step ? '✓' : i + 1}</div>
              <span className="stepper-label">{label}</span>
              {i < STEP_LABELS.length - 1 && <div className="stepper-line" />}
            </div>
          ))}
        </div>

        {step === 0 && <StepOne   form={form} onChange={handleChange} onNext={() => setStep(1)} onScanComplete={setScanResult} />}
        {step === 1 && <StepTwo   form={form} onChange={handleChange} onNext={() => setStep(2)} onBack={() => setStep(0)} scanResult={scanResult} />}
        {step === 2 && (
          <StepThree
            form={form}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
          />
        )}
      </div>
    </main>
  );
}
