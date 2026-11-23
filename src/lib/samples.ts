import { RawModelReport } from './reproducibility.ts';

export interface SampleMethodsPreset {
  id: string;
  label: string;
  discipline: string;
  text: string;
  precomputedReport: RawModelReport;
}

export const SAMPLE_METHODS_PRESETS: SampleMethodsPreset[] = [
  {
    id: 'wet-lab-qpcr',
    label: 'Wet-Lab qPCR Assay',
    discipline: 'Molecular Biology',
    text: `Total RNA was extracted from treated and untreated HeLa cells using TRIzol reagent according to the manufacturer's instructions. Cells were cultured in DMEM supplemented with fetal bovine serum at 37 °C prior to treatment with the test compound for 24 hours. cDNA was synthesized from 1 µg of total RNA using a commercial reverse transcription kit, and quantitative PCR was performed on a real-time thermal cycler using SYBR Green master mix. GAPDH was used as the internal reference gene, and relative expression was calculated using the 2^-ΔΔCt method. Each experiment was repeated across three biological replicates. Statistical significance between treated and control groups was evaluated using Student's t-test in GraphPad Prism, with p < 0.05 considered significant.`,
    precomputedReport: {
      studyType: 'Wet-lab molecular biology (RT-qPCR)',
      findings: [
        {
          category: 'Materials and reagents',
          status: 'unclear',
          quote:
            'Total RNA was extracted from treated and untreated HeLa cells using TRIzol reagent according to the manufacturer\'s instructions.',
          issue:
            'Reagent vendors, catalog numbers, primer sequences, and cell line authentication/source are omitted.',
          suggestedFix:
            'Specify vendors and catalog numbers for TRIzol, DMEM, FBS, the RT kit, and SYBR Green mix, list forward/reverse primer sequences for target genes and GAPDH, and state the HeLa cell line source (e.g., ATCC CCL-2).',
        },
        {
          category: 'Quantities and concentrations',
          status: 'unclear',
          quote:
            'cDNA was synthesized from 1 µg of total RNA using a commercial reverse transcription kit',
          issue:
            'RNA input mass (1 µg) is given, but test compound concentration, FBS percentage, and final primer/cDNA concentrations in qPCR reactions are missing.',
          suggestedFix:
            'Add the exact molarity/concentration of the test compound, FBS percentage (e.g., 10% v/v), final reaction volume (e.g., 20 µL), and primer concentrations (e.g., 250 nM).',
        },
        {
          category: 'Equipment and settings',
          status: 'missing',
          quote:
            'quantitative PCR was performed on a real-time thermal cycler using SYBR Green master mix.',
          issue:
            'The thermal cycler model and cycling parameters (denaturation, annealing temperature, cycle count, melt curve) are not reported.',
          suggestedFix:
            'Name the instrument (e.g., Bio-Rad CFX96) and list thermal cycling conditions (e.g., 95 °C for 3 min; 40 cycles of 95 °C for 10 s and 60 °C for 30 s, followed by melt-curve analysis).',
        },
        {
          category: 'Conditions',
          status: 'unclear',
          quote:
            'Cells were cultured in DMEM supplemented with fetal bovine serum at 37 °C prior to treatment with the test compound for 24 hours.',
          issue:
            'Temperature (37 °C) and treatment duration (24 h) are stated, but CO2 concentration, cell seeding density, and confluence at treatment are missing.',
          suggestedFix:
            'Include incubator atmosphere (e.g., 5% CO2, humidified) and seeding density (e.g., 2 × 10^5 cells/well in 6-well plates, treated at ~70% confluence).',
        },
        {
          category: 'Samples and replicates',
          status: 'unclear',
          quote: 'Each experiment was repeated across three biological replicates.',
          issue:
            'Biological replicate count (n = 3) is stated, but the number of technical qPCR replicates per sample and whether samples were excluded are not specified.',
          suggestedFix:
            'Clarify technical replicates (e.g., "three independent biological replicates, each assayed in technical triplicate") and state any outlier exclusion rules.',
        },
        {
          category: 'Controls',
          status: 'unclear',
          quote: 'GAPDH was used as the internal reference gene',
          issue:
            'Untreated cells and an internal reference gene are noted, but vehicle control (e.g., DMSO) and qPCR negative controls (no-template, no-RT) are omitted.',
          suggestedFix:
            'State whether control cells received matching vehicle (e.g., 0.1% DMSO) and confirm inclusion of no-template (NTC) and no-reverse-transcriptase (-RT) controls.',
        },
        {
          category: 'Software and versions',
          status: 'unclear',
          quote:
            'Statistical significance between treated and control groups was evaluated using Student\'s t-test in GraphPad Prism',
          issue:
            'GraphPad Prism is named, but the exact software version and instrument acquisition software are omitted.',
          suggestedFix:
            'Specify the exact software versions used for analysis and instrument export (e.g., GraphPad Prism v10.1.2).',
        },
        {
          category: 'Statistical methods',
          status: 'unclear',
          quote:
            'evaluated using Student\'s t-test in GraphPad Prism, with p < 0.05 considered significant.',
          issue:
            'Does not state whether the t-test was two-tailed, paired or unpaired, whether normality/variance assumptions were checked, or whether multiple-comparison correction was applied.',
          suggestedFix:
            'Specify test directionality and pairing (e.g., "two-tailed unpaired Student\'s t-test after checking normality via Shapiro-Wilk") and indicate how variance/error bars are plotted.',
        },
        {
          category: 'Data and code availability',
          status: 'missing',
          quote: '',
          issue:
            'No mention of where raw Ct values or processed expression tables can be accessed.',
          suggestedFix:
            'Add a statement linking raw Ct data in supplementary files or a public repository (e.g., Zenodo or Figshare DOI).',
        },
      ],
      skippedCategories: [],
    },
  },
  {
    id: 'ml-benchmark',
    label: 'ML Classification Study',
    discipline: 'Computational / Machine Learning',
    text: `We evaluated a gradient-boosted decision tree classifier and a three-layer multilayer perceptron on a curated clinical readmission dataset containing 12,480 patient encounters. Missing numerical features were imputed using median values computed on the training split, and categorical variables were one-hot encoded. The dataset was partitioned into 80% training and 20% test sets using stratified sampling. Models were trained in Python using scikit-learn, and hyperparameters were tuned via 5-fold cross-validation maximizing AUROC. Performance on the held-out test set is reported as mean AUROC across five random seeds. Model differences were compared using DeLong's test. Our preprocessing scripts and model configuration files are available on GitHub.`,
    precomputedReport: {
      studyType: 'Computational / Machine learning benchmark',
      findings: [
        {
          category: 'Quantities and concentrations',
          status: 'unclear',
          quote:
            'containing 12,480 patient encounters. Missing numerical features were imputed using median values',
          issue:
            'Total encounter count (12,480) is stated, but class balance, feature count, and exact hyperparameter search ranges/MLP layer widths are not specified.',
          suggestedFix:
            'State the number of input features, positive class prevalence (%), MLP hidden layer sizes/activation functions, and the hyperparameter grid explored.',
        },
        {
          category: 'Equipment and settings',
          status: 'missing',
          quote: '',
          issue:
            'Compute hardware (CPU/GPU type, RAM) is omitted, which affects runtime and floating-point reproducibility for neural network training.',
          suggestedFix:
            'Report hardware used for training (e.g., CPU model or GPU architecture and memory).',
        },
        {
          category: 'Conditions',
          status: 'unclear',
          quote:
            'The dataset was partitioned into 80% training and 20% test sets using stratified sampling.',
          issue:
            'Stratified 80/20 splitting is described, but patient-level grouping (preventing the same patient from appearing in both train and test splits) and training stopping criteria are omitted.',
          suggestedFix:
            'Clarify whether splits were grouped by patient ID to prevent leakage and report early-stopping or epoch/iteration limits.',
        },
        {
          category: 'Samples and replicates',
          status: 'reported',
          quote:
            'Performance on the held-out test set is reported as mean AUROC across five random seeds.',
          issue:
            'Sample size (12,480 encounters), split ratio, cross-validation folds (5), and repeat runs across 5 random seeds are clearly documented.',
          suggestedFix:
            'Optionally list the exact integer seed values (e.g., seeds 0–4) for bitwise reproducibility.',
        },
        {
          category: 'Software and versions',
          status: 'unclear',
          quote: 'Models were trained in Python using scikit-learn',
          issue:
            'Python and scikit-learn are named, but exact version numbers and any auxiliary libraries (e.g., XGBoost/LightGBM/PyTorch) are missing.',
          suggestedFix:
            'List pinned versions (e.g., Python 3.11.6, scikit-learn 1.5.1, numpy 1.26.4) and state which library implemented the gradient-boosted trees.',
        },
        {
          category: 'Statistical methods',
          status: 'unclear',
          quote: 'Model differences were compared using DeLong\'s test.',
          issue:
            'DeLong\'s test is named for AUROC comparison, but confidence intervals, significance threshold (alpha), and dispersion metric (SD vs. 95% CI across seeds) are missing.',
          suggestedFix:
            'Specify how confidence intervals were computed (e.g., 95% bootstrap CI or SD across the 5 seeds) and state the alpha level used for DeLong\'s test.',
        },
        {
          category: 'Data and code availability',
          status: 'unclear',
          quote:
            'Our preprocessing scripts and model configuration files are available on GitHub.',
          issue:
            'GitHub is mentioned without a repository URL, commit hash, or data access conditions for the clinical encounters dataset.',
          suggestedFix:
            'Include the full repository URL and release tag/commit hash, plus dataset access instructions or data-use agreement details.',
        },
      ],
      skippedCategories: [
        {
          category: 'Materials and reagents',
          reason: 'Computational study with no wet-lab reagents or physical consumables.',
        },
        {
          category: 'Controls',
          reason: 'Evaluated as a comparative benchmark between two model families; a simple baseline comparison would still strengthen interpretation.',
        },
      ],
    },
  },
  {
    id: 'field-ecology',
    label: 'Field Ecology Transect',
    discipline: 'Environmental Science',
    text: `Pollinator visitation surveys were conducted across six restored meadow sites and six unrestored control pastures in northern Vermont during July 2025. At each site, two 50 m transects were walked for 20 minutes between 09:00 and 15:00 on sunny days with low wind. All flower-visiting insects observed within 1 m of the transect line were recorded to morphospecies, and representative specimens were collected with a sweep net for later identification. Floral abundance was estimated in 1 m² quadrats placed every 10 m along each transect. Differences in pollinator richness between restored and control sites were analyzed using a generalized linear mixed-effects model with site as a random effect in R (v4.4.1, lme4 v1.1-35).`,
    precomputedReport: {
      studyType: 'Field ecology observational survey',
      findings: [
        {
          category: 'Materials and reagents',
          status: 'unclear',
          quote:
            'representative specimens were collected with a sweep net for later identification.',
          issue:
            'Taxonomic keys/references used to identify specimens and preservation methods (e.g., ethanol, pinning) are not stated.',
          suggestedFix:
            'Cite the taxonomic keys or reference collections used for species-level identification and note specimen preservation and voucher deposition.',
        },
        {
          category: 'Equipment and settings',
          status: 'unclear',
          quote: 'Floral abundance was estimated in 1 m² quadrats placed every 10 m along each transect.',
          issue:
            'Quadrat dimensions and sweep-net collection are mentioned, but any handheld weather meter (anemometer/thermometer) used to verify wind/temperature thresholds is omitted.',
          suggestedFix:
            'Specify the instrument used to measure wind speed and ambient temperature at survey start, or state the data source used.',
        },
        {
          category: 'Conditions',
          status: 'unclear',
          quote:
            'walked for 20 minutes between 09:00 and 15:00 on sunny days with low wind.',
          issue:
            'Qualitative weather criteria ("sunny days with low wind") cannot be replicated consistently without numeric thresholds.',
          suggestedFix:
            'Define objective thresholds (e.g., ambient temperature >= 18 °C, wind speed < 15 km/h, cloud cover < 40%) and state how many times each transect was sampled.',
        },
        {
          category: 'Samples and replicates',
          status: 'unclear',
          quote:
            'conducted across six restored meadow sites and six unrestored control pastures in northern Vermont during July 2025. At each site, two 50 m transects were walked',
          issue:
            'Site and transect replication are clear (6 sites × 2 treatments × 2 transects), but minimum inter-site distance and number of repeat visits per site are missing.',
          suggestedFix:
            'Report minimum distance between sites (to confirm spatial independence), site coordinates/elevation range, and total survey visits per transect.',
        },
        {
          category: 'Controls',
          status: 'reported',
          quote:
            'across six restored meadow sites and six unrestored control pastures',
          issue:
            'Paired unrestored control pastures (n = 6) serve as explicit field controls.',
          suggestedFix:
            'Consider noting how control pastures matched restored sites in area, slope, or surrounding land cover.',
        },
        {
          category: 'Software and versions',
          status: 'reported',
          quote: 'in R (v4.4.1, lme4 v1.1-35).',
          issue: 'Exact R version and lme4 package version are explicitly reported.',
          suggestedFix: '',
        },
        {
          category: 'Statistical methods',
          status: 'unclear',
          quote:
            'analyzed using a generalized linear mixed-effects model with site as a random effect',
          issue:
            'Error distribution family (e.g., Poisson vs. negative binomial), link function, offset/covariates (floral abundance), and model diagnostic checks are omitted.',
          suggestedFix:
            'State the GLMM distribution family and link (e.g., Poisson with log link), whether floral abundance or transect was included as a covariate/random term, and how overdispersion was checked.',
        },
        {
          category: 'Data and code availability',
          status: 'missing',
          quote: '',
          issue:
            'No repository link or statement indicates where raw transect counts, floral surveys, and R scripts are archived.',
          suggestedFix:
            'Deposit anonymized site data and the R analysis script in a public repository (e.g., Dryad or Zenodo) and include the DOI.',
        },
      ],
      skippedCategories: [
        {
          category: 'Quantities and concentrations',
          reason: 'Field survey without chemical concentrations or solution dilutions; spatial and count quantities are covered under Samples and Conditions.',
        },
      ],
    },
  },
];
