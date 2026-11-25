import { RawModelReport } from './reproducibility.ts';

export interface SampleMethodsPreset {
  id: string;
  label: string;
  discipline: string;
  text: string;
  precomputedReport: RawModelReport;
  repairedText: string;
  repairedReport: RawModelReport;
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
          draftTemplate:
            'HeLa cells ([ATCC CCL-2]) were cultured in DMEM ([Vendor, Cat. #]) and RNA was extracted with TRIzol ([Vendor, Cat. #]) using [Target/GAPDH] primers (F: [5\'-...-3\'], R: [5\'-...-3\']).',
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
          draftTemplate:
            'Cells received [concentration µM] test compound in DMEM with [10% v/v] FBS, and qPCR reactions ([20 µL] total) contained [cDNA ng] and [250 nM] each primer.',
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
          draftTemplate:
            'Amplification was run on a [Instrument model] at [95 °C for 3 min], followed by [40 cycles] of [95 °C for 10 s] and [60 °C for 30 s] with melt-curve verification.',
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
          draftTemplate:
            'Cells were seeded at [2 x 10^5 cells/well] in [6-well] plates, grown at 37 °C in [5% CO2] humidified air to [~70% confluence], and treated for 24 hours.',
        },
        {
          category: 'Samples and replicates',
          status: 'unclear',
          quote: 'Each experiment was repeated across three biological replicates.',
          issue:
            'Biological replicate count (n = 3) is stated, but the number of technical qPCR replicates per sample and whether samples were excluded are not specified.',
          suggestedFix:
            'Clarify technical replicates (e.g., "three independent biological replicates, each assayed in technical triplicate") and state any outlier exclusion rules.',
          draftTemplate:
            'Three independent biological replicates were each assayed in [technical triplicate], with [no samples excluded / predefined outlier criteria].',
        },
        {
          category: 'Controls',
          status: 'unclear',
          quote: 'GAPDH was used as the internal reference gene',
          issue:
            'Untreated cells and an internal reference gene are noted, but vehicle control (e.g., DMSO) and qPCR negative controls (no-template, no-RT) are omitted.',
          suggestedFix:
            'State whether control cells received matching vehicle (e.g., 0.1% DMSO) and confirm inclusion of no-template (NTC) and no-reverse-transcriptase (-RT) controls.',
          draftTemplate:
            'Control cultures received matching [0.1% v/v DMSO] vehicle, and each qPCR plate included [no-template (NTC)] and [no-reverse-transcriptase (-RT)] controls.',
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
          draftTemplate:
            'Ct values were exported in [Acquisition software vX.Y] and analyzed in GraphPad Prism [v10.1.2].',
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
          draftTemplate:
            'Groups were compared by [two-tailed unpaired] Student\'s t-test after checking normality with [Shapiro-Wilk]; data are reported as [mean +/- SD], p < 0.05.',
        },
        {
          category: 'Data and code availability',
          status: 'missing',
          quote: '',
          issue:
            'No mention of where raw Ct values or processed expression tables can be accessed.',
          suggestedFix:
            'Add a statement linking raw Ct data in supplementary files or a public repository (e.g., Zenodo or Figshare DOI).',
          draftTemplate:
            'Raw Ct values and processed fold-change tables are deposited at [Repository name] under [DOI / accession #].',
        },
      ],
      skippedCategories: [],
    },
    repairedText: `HeLa cells (ATCC CCL-2, mycoplasma-tested) were cultured in high-glucose DMEM (Gibco, Cat. #11965092) supplemented with 10% (v/v) fetal bovine serum (Gibco, Cat. #16000044) at 37 °C in a humidified 5% CO2 incubator. Cells were seeded at 2 × 10^5 cells/well in 6-well plates, grown to ~70% confluence, and treated with 10 µM test compound dissolved in DMSO or matching 0.1% (v/v) DMSO vehicle control for 24 hours. Total RNA was extracted using TRIzol reagent (Thermo Fisher Scientific, Cat. #15596026) according to the manufacturer's instructions. cDNA was synthesized from 1 µg of total RNA in a 20 µL reaction using the High-Capacity cDNA Reverse Transcription Kit (Applied Biosystems, Cat. #4368814). Quantitative PCR was performed in 20 µL reactions containing 10 ng cDNA, 250 nM each forward and reverse primer (GAPDH F: 5'-GAAGGTGAAGGTCGGAGTC-3', R: 5'-GAAGATGGTGATGGGATTTC-3'; target primers listed in Supplementary Table S1), and PowerUp SYBR Green Master Mix (Applied Biosystems, Cat. #A25742) on a Bio-Rad CFX96 Real-Time System (CFX Maestro v2.3). Thermal cycling consisted of 95 °C for 3 min followed by 40 cycles of 95 °C for 10 s and 60 °C for 30 s, plus melt-curve analysis (65 to 95 °C, 0.5 °C increments). No-template (NTC) and no-reverse-transcriptase (-RT) controls were included on every plate. GAPDH served as the internal reference gene, and relative expression was calculated via the 2^-ΔΔCt method across three independent biological replicates, each assayed in technical triplicate with no excluded samples. Groups were compared using a two-tailed unpaired Student's t-test in GraphPad Prism v10.1.2 after verifying normality with the Shapiro-Wilk test (data reported as mean ± SD, p < 0.05). Raw Ct values and analysis spreadsheets are available on Zenodo (doi:10.5281/zenodo.10492811).`,
    repairedReport: {
      studyType: 'Wet-lab molecular biology (RT-qPCR)',
      findings: [
        {
          category: 'Materials and reagents',
          status: 'reported',
          quote:
            'HeLa cells (ATCC CCL-2, mycoplasma-tested) were cultured in high-glucose DMEM (Gibco, Cat. #11965092)',
          issue:
            'Cell line source (ATCC CCL-2), reagent vendors, catalog numbers, and primer sequences are explicitly documented.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Quantities and concentrations',
          status: 'reported',
          quote:
            'treated with 10 µM test compound dissolved in DMSO or matching 0.1% (v/v) DMSO vehicle control for 24 hours.',
          issue:
            'Serum percentage (10% v/v), compound concentration (10 µM), RNA input (1 µg), reaction volume (20 µL), cDNA mass (10 ng), and primer concentration (250 nM) are stated.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Equipment and settings',
          status: 'reported',
          quote:
            'on a Bio-Rad CFX96 Real-Time System (CFX Maestro v2.3). Thermal cycling consisted of 95 °C for 3 min followed by 40 cycles of 95 °C for 10 s and 60 °C for 30 s, plus melt-curve analysis (65 to 95 °C, 0.5 °C increments).',
          issue:
            'Instrument model, acquisition software, cycling temperatures, cycle count, and melt-curve settings are completely specified.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Conditions',
          status: 'reported',
          quote:
            'at 37 °C in a humidified 5% CO2 incubator. Cells were seeded at 2 × 10^5 cells/well in 6-well plates, grown to ~70% confluence',
          issue:
            'Incubator atmosphere, temperature, seeding density, plate format, confluence at dosing, and treatment duration are specified.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Samples and replicates',
          status: 'reported',
          quote:
            'across three independent biological replicates, each assayed in technical triplicate with no excluded samples.',
          issue:
            'Biological and technical replicate counts plus sample exclusion status are explicitly defined.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Controls',
          status: 'reported',
          quote:
            'No-template (NTC) and no-reverse-transcriptase (-RT) controls were included on every plate.',
          issue:
            'Matched 0.1% DMSO vehicle control, GAPDH reference gene, NTC, and -RT controls are all included.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Software and versions',
          status: 'reported',
          quote: 'in GraphPad Prism v10.1.2',
          issue:
            'Exact versions for both CFX Maestro (v2.3) and GraphPad Prism (v10.1.2) are stated.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Statistical methods',
          status: 'reported',
          quote:
            'two-tailed unpaired Student\'s t-test in GraphPad Prism v10.1.2 after verifying normality with the Shapiro-Wilk test (data reported as mean ± SD, p < 0.05).',
          issue:
            'Test type, directionality, pairing, normality verification, error summary, and alpha threshold are clearly specified.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Data and code availability',
          status: 'reported',
          quote:
            'Raw Ct values and analysis spreadsheets are available on Zenodo (doi:10.5281/zenodo.10492811).',
          issue:
            'Public Zenodo repository DOI for raw Ct values and processed tables is provided.',
          suggestedFix: '',
          draftTemplate: '',
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
          draftTemplate:
            'The dataset included [N features] with [X% positive] class prevalence; the MLP used hidden layers [(128, 64)] with [ReLU] activations tuned over learning rates [grid].',
        },
        {
          category: 'Equipment and settings',
          status: 'missing',
          quote: '',
          issue:
            'Compute hardware (CPU/GPU type, RAM) is omitted, which affects runtime and floating-point reproducibility for neural network training.',
          suggestedFix:
            'Report hardware used for training (e.g., CPU model or GPU architecture and memory).',
          draftTemplate:
            'All experiments ran on [CPU/GPU model, e.g., dual Intel Xeon Gold 6338 / NVIDIA A100 80GB] with [RAM GB] system memory.',
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
          draftTemplate:
            'Splits were grouped by [patient ID] to prevent data leakage, and MLP training stopped after [max_iter / patience] epochs without validation AUROC improvement.',
        },
        {
          category: 'Samples and replicates',
          status: 'reported',
          quote:
            'Performance on the held-out test set is reported as mean AUROC across five random seeds.',
          issue:
            'Sample size (12,480 encounters), split ratio, cross-validation folds (5), and repeat runs across 5 random seeds are clearly documented.',
          suggestedFix:
            'Optionally list the exact integer seed values (e.g., seeds 0 to 4) for bitwise reproducibility.',
          draftTemplate: '',
        },
        {
          category: 'Software and versions',
          status: 'unclear',
          quote: 'Models were trained in Python using scikit-learn',
          issue:
            'Python and scikit-learn are named, but exact version numbers and any auxiliary libraries (e.g., XGBoost/LightGBM/PyTorch) are missing.',
          suggestedFix:
            'List pinned versions (e.g., Python 3.11.6, scikit-learn 1.5.1, numpy 1.26.4) and state which library implemented the gradient-boosted trees.',
          draftTemplate:
            'Models were implemented in Python [3.11.6] using scikit-learn [1.5.1], numpy [1.26.4], and [xgboost/lightgbm version].',
        },
        {
          category: 'Statistical methods',
          status: 'unclear',
          quote: 'Model differences were compared using DeLong\'s test.',
          issue:
            'DeLong\'s test is named for AUROC comparison, but confidence intervals, significance threshold (alpha), and dispersion metric (SD vs. 95% CI across seeds) are missing.',
          suggestedFix:
            'Specify how confidence intervals were computed (e.g., 95% bootstrap CI or SD across the 5 seeds) and state the alpha level used for DeLong\'s test.',
          draftTemplate:
            'AUROC is reported as mean +/- [SD / 95% bootstrap CI] across seeds, with pairwise DeLong tests evaluated at two-sided alpha = [0.05].',
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
          draftTemplate:
            'Code is archived at [https://github.com/org/repo] (commit [hash]); de-identified cohort access is governed by [repository / DUA procedure].',
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
    repairedText: `We evaluated a gradient-boosted decision tree classifier (HistGradientBoostingClassifier) and a three-layer multilayer perceptron (hidden layers 128-64-32 with ReLU activations) on a curated clinical readmission dataset containing 12,480 patient encounters (42 input features, 18.4% positive readmission prevalence). Missing numerical features were imputed using median values computed strictly on the training split, and categorical variables were one-hot encoded. The dataset was partitioned into 80% training and 20% test sets using stratified group sampling by unique patient ID to prevent cross-split leakage, and MLP training used Adam optimization (learning rate grid {1e-4, 1e-3, 1e-2}) with early stopping after 15 epochs without validation AUROC improvement. Models were trained in Python 3.11.6 using scikit-learn 1.5.1 and numpy 1.26.4 on a workstation with an AMD Ryzen 9 7950X CPU and 64 GB RAM, with hyperparameters tuned via 5-fold stratified group cross-validation maximizing AUROC. Performance on the held-out test set is reported as mean AUROC +/- SD across five fixed random seeds (42, 43, 44, 45, 46). Pairwise AUROC differences were compared using two-sided DeLong's test at alpha = 0.05 alongside 95% bootstrap confidence intervals (2,000 resamples). Preprocessing scripts, environment lockfiles, and model configuration files are available at https://github.com/example-lab/readmission-bench (commit 7a9c41f); de-identified cohort access is available upon institutional data-use approval via PhysioNet (doi:10.13026/readmit-2025).`,
    repairedReport: {
      studyType: 'Computational / Machine learning benchmark',
      findings: [
        {
          category: 'Quantities and concentrations',
          status: 'reported',
          quote:
            'containing 12,480 patient encounters (42 input features, 18.4% positive readmission prevalence).',
          issue:
            'Dataset size, feature dimensionality, positive class prevalence, MLP architecture, and learning rate search grid are specified.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Equipment and settings',
          status: 'reported',
          quote: 'on a workstation with an AMD Ryzen 9 7950X CPU and 64 GB RAM',
          issue:
            'Exact CPU architecture and system RAM used for model training are reported.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Conditions',
          status: 'reported',
          quote:
            'using stratified group sampling by unique patient ID to prevent cross-split leakage, and MLP training used Adam optimization (learning rate grid {1e-4, 1e-3, 1e-2}) with early stopping after 15 epochs without validation AUROC improvement.',
          issue:
            'Patient-level grouping, optimization algorithm, and stopping criterion are explicitly documented.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Samples and replicates',
          status: 'reported',
          quote:
            'across five fixed random seeds (42, 43, 44, 45, 46).',
          issue:
            'Cross-validation folds, held-out split ratio, and exact random seed integers are documented.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Software and versions',
          status: 'reported',
          quote: 'in Python 3.11.6 using scikit-learn 1.5.1 and numpy 1.26.4',
          issue:
            'Pinned Python, scikit-learn, and numpy versions plus classifier class name are specified.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Statistical methods',
          status: 'reported',
          quote:
            'two-sided DeLong\'s test at alpha = 0.05 alongside 95% bootstrap confidence intervals (2,000 resamples).',
          issue:
            'Test directionality, alpha threshold, dispersion metric (SD), and bootstrap CI resamples are reported.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Data and code availability',
          status: 'reported',
          quote:
            'available at https://github.com/example-lab/readmission-bench (commit 7a9c41f); de-identified cohort access is available upon institutional data-use approval via PhysioNet (doi:10.13026/readmit-2025).',
          issue:
            'Full repository URL, commit hash, environment lockfile reference, and PhysioNet data access terms are stated.',
          suggestedFix: '',
          draftTemplate: '',
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
          draftTemplate:
            'Collected insects were preserved in [70% ethanol / pinned], identified using [taxonomic key reference], and voucher specimens deposited at [collection].',
        },
        {
          category: 'Equipment and settings',
          status: 'unclear',
          quote: 'Floral abundance was estimated in 1 m² quadrats placed every 10 m along each transect.',
          issue:
            'Quadrat dimensions and sweep-net collection are mentioned, but any handheld weather meter (anemometer/thermometer) used to verify wind/temperature thresholds is omitted.',
          suggestedFix:
            'Specify the instrument used to measure wind speed and ambient temperature at survey start, or state the data source used.',
          draftTemplate:
            'Wind speed and ambient temperature were measured at transect start using a [handheld anemometer model, e.g., Kestrel 3000].',
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
          draftTemplate:
            'Surveys were conducted only when ambient temperature was [>= 18 °C], wind speed [< 15 km/h], and cloud cover [< 40%], across [3] repeat visits per transect.',
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
          draftTemplate:
            'Sites were separated by at least [1.5 km] (elevation [120-340 m]) and each transect was surveyed [3 times] across the season.',
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
          draftTemplate: '',
        },
        {
          category: 'Software and versions',
          status: 'reported',
          quote: 'in R (v4.4.1, lme4 v1.1-35).',
          issue: 'Exact R version and lme4 package version are explicitly reported.',
          suggestedFix: '',
          draftTemplate: '',
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
          draftTemplate:
            'Richness was modeled using a [Poisson GLMM with log link], including [floral abundance] as a fixed covariate and verifying dispersion via [DHARMa].',
        },
        {
          category: 'Data and code availability',
          status: 'missing',
          quote: '',
          issue:
            'No repository link or statement indicates where raw transect counts, floral surveys, and R scripts are archived.',
          suggestedFix:
            'Deposit anonymized site data and the R analysis script in a public repository (e.g., Dryad or Zenodo) and include the DOI.',
          draftTemplate:
            'Site survey tables and R analysis scripts are archived on [Dryad / Zenodo] at [DOI].',
        },
      ],
      skippedCategories: [
        {
          category: 'Quantities and concentrations',
          reason: 'Field survey without chemical concentrations or solution dilutions; spatial and count quantities are covered under Samples and Conditions.',
        },
      ],
    },
    repairedText: `Pollinator visitation surveys were conducted across six restored meadow sites and six paired unrestored control pastures matched for area and elevation (120 to 340 m) in northern Vermont during July 2025, with all sites separated by at least 1.5 km. At each site, two 50 m transects were walked for 20 minutes across three repeat visits per transect between 09:00 and 15:00 when ambient temperature was >= 18 °C, wind speed was < 15 km/h, and cloud cover was < 40%, as measured at transect start using a Kestrel 3000 handheld weather meter. All flower-visiting insects observed within 1 m of the transect line were recorded, and representative specimens were collected with a 38 cm diameter sweep net, pinned or stored in 70% ethanol, identified using Mitchell's Bees of the Eastern United States taxonomic keys, and deposited as vouchers in the University of Vermont Zadock Thompson Insect Collection. Floral abundance was estimated in 1 m² quadrats placed every 10 m along each transect. Differences in pollinator richness between restored and control sites were analyzed using a Poisson generalized linear mixed-effects model (log link) with log-transformed floral abundance as a fixed covariate and transect nested within site as a random effect in R (v4.4.1, lme4 v1.1-35), after confirming absence of overdispersion via DHARMa residual checks (alpha = 0.05). Site survey tables and R analysis scripts are archived on Dryad (doi:10.5061/dryad.vtpollinator2025).`,
    repairedReport: {
      studyType: 'Field ecology observational survey',
      findings: [
        {
          category: 'Materials and reagents',
          status: 'reported',
          quote:
            'pinned or stored in 70% ethanol, identified using Mitchell\'s Bees of the Eastern United States taxonomic keys, and deposited as vouchers in the University of Vermont Zadock Thompson Insect Collection.',
          issue:
            'Preservation methods, taxonomic keys, and voucher repository are explicitly documented.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Equipment and settings',
          status: 'reported',
          quote:
            'using a Kestrel 3000 handheld weather meter.',
          issue:
            'Weather meter model, sweep-net diameter (38 cm), and quadrat dimensions (1 m²) are reported.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Conditions',
          status: 'reported',
          quote:
            'when ambient temperature was >= 18 °C, wind speed was < 15 km/h, and cloud cover was < 40%',
          issue:
            'Quantitative temperature, wind speed, cloud cover, time window, and duration thresholds are clearly stated.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Samples and replicates',
          status: 'reported',
          quote:
            'with all sites separated by at least 1.5 km. At each site, two 50 m transects were walked for 20 minutes across three repeat visits per transect',
          issue:
            'Site count, minimum inter-site separation, elevation range, transect count, and repeat visit frequency are specified.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Controls',
          status: 'reported',
          quote:
            'six paired unrestored control pastures matched for area and elevation (120 to 340 m)',
          issue:
            'Paired control pastures matched on area and elevation serve as explicit controls.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Software and versions',
          status: 'reported',
          quote: 'in R (v4.4.1, lme4 v1.1-35)',
          issue: 'Exact R and lme4 versions are explicitly reported.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Statistical methods',
          status: 'reported',
          quote:
            'Poisson generalized linear mixed-effects model (log link) with log-transformed floral abundance as a fixed covariate and transect nested within site as a random effect in R (v4.4.1, lme4 v1.1-35), after confirming absence of overdispersion via DHARMa residual checks (alpha = 0.05).',
          issue:
            'Distribution family, link function, covariates, nested random effects, residual diagnostic tool, and alpha level are stated.',
          suggestedFix: '',
          draftTemplate: '',
        },
        {
          category: 'Data and code availability',
          status: 'reported',
          quote:
            'Site survey tables and R analysis scripts are archived on Dryad (doi:10.5061/dryad.vtpollinator2025).',
          issue:
            'Dryad DOI for survey data and R scripts is provided.',
          suggestedFix: '',
          draftTemplate: '',
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
