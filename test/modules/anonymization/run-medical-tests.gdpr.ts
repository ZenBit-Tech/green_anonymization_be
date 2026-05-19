import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from 'modules/anonymization/anonymization.service';

const runMedicalTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR medical data anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple medical data types', async () => {
      const input =
        'My records mention Type 1 diabetes, sometimes written as T1D, insulin-dependent diabetes mellitus, or just “chronic condition,” with notes about blood glucose levels like 5.6 mmol/L or “within normal range.”';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^My records mention <[^>]+>, sometimes written as <[^>]+>, <[^>]+>, or just “<[^>]+>,” with notes about blood glucose levels like <[^>]+> or “<[^>]+>.”$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: diabetes', async () => {
      const input = 'Patient has diabetes.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Patient has <[^>]+>\.$/);
    });

    it('should anonymize: hypertension stage 2', async () => {
      const input = 'Diagnosed with hypertension stage 2.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Diagnosed with <[^>]+>\.$/);
    });

    it('should anonymize: COVID-19 positive', async () => {
      const input = 'Condition: COVID-19 positive.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Condition: <[^>]+>\.$/);
    });

    it('should anonymize: glucose (7.8 mmol/L)', async () => {
      const input = 'Glucose level 7.8 mmol/L.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Glucose level <[^>]+>\.$/);
    });

    it('should anonymize: asthma', async () => {
      const input = 'History of asthma.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^History of <[^>]+>\.$/);
    });

    it('should anonymize: diabetes mellitus type 2', async () => {
      const input = 'Diagnosed with diabetes mellitus type 2.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Diagnosed with <[^>]+>\.$/);
    });

    it('should anonymize: hypertension stage 1', async () => {
      const input = 'Patient has hypertension stage 1.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Patient has <[^>]+>\.$/);
    });

    it('should anonymize: COVID-19 infection', async () => {
      const input = 'Confirmed COVID-19 infection reported.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Confirmed <[^>]+> reported\.$/);
    });

    it('should anonymize: pneumonia bacterial', async () => {
      const input = 'Chest X-ray shows pneumonia bacterial.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Chest X-ray shows <[^>]+>\.$/);
    });

    it('should anonymize: asthma chronic', async () => {
      const input = 'History of asthma chronic noted.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^History of <[^>]+> noted\.$/);
    });

    it('should anonymize: myocardial infarction', async () => {
      const input = 'Previous myocardial infarction documented.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Previous <[^>]+> documented\.$/);
    });

    it('should anonymize: chronic kidney disease', async () => {
      const input = 'Stage chronic kidney disease diagnosed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Stage <[^>]+> diagnosed\.$/);
    });

    it('should anonymize: depression major', async () => {
      const input = 'Treated for depression major currently.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Treated for <[^>]+> currently\.$/,
      );
    });

    it('should anonymize: anxiety disorder generalized', async () => {
      const input = 'Anxiety disorder generalized managed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> managed\.$/);
    });

    it('should anonymize: COPD emphysema', async () => {
      const input = 'COPD emphysema in remission.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> in remission\.$/);
    });

    it('should anonymize: cancer melanoma', async () => {
      const input = 'Skin cancer melanoma treated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Skin <[^>]+> treated\.$/);
    });

    it('should anonymize: hepatitis C viral', async () => {
      const input = 'Hepatitis C viral status positive.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> status positive\.$/);
    });

    it('should anonymize: HIV infection AIDS', async () => {
      const input = 'HIV infection AIDS stage managed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> stage managed\.$/);
    });

    it('should anonymize: arthritis rheumatoid', async () => {
      const input = 'Arthritis rheumatoid affects joints.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> affects joints\.$/);
    });

    it('should anonymize: glaucoma angle-closure', async () => {
      const input = 'Glaucoma angle-closure under control.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> under control\.$/);
    });

    it('should anonymize: migraine with aura', async () => {
      const input = 'Migraine with aura episodes frequent.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> episodes frequent\.$/);
    });

    it('should anonymize: thyroid hypothyroidism', async () => {
      const input = 'Thyroid hypothyroidism requires medication.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> requires medication\.$/);
    });

    it('should anonymize: sleep apnea obstructive', async () => {
      const input = 'Sleep apnea obstructive CPAP treated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> CPAP treated\.$/);
    });

    it('should anonymize: obesity morbid', async () => {
      const input = 'Obesity morbid BMI elevated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> BMI elevated\.$/);
    });

    it('should anonymize: stroke ischemic', async () => {
      const input = 'Previous stroke ischemic recovered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Previous <[^>]+> recovered\.$/);
    });

    it('should anonymize: blood glucose level 6.5 mmol/L', async () => {
      const input = 'Blood glucose level 6.5 mmol/L normal.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Blood glucose level <[^>]+> normal\.$/,
      );
    });

    it('should anonymize: hemoglobin A1c 8.2%', async () => {
      const input = 'Hemoglobin A1c 8.2% slightly elevated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Hemoglobin A1c <[^>]+> slightly elevated\.$/,
      );
    });

    it('should anonymize: blood pressure 140/90', async () => {
      const input = 'Blood pressure 140/90 mmHg measured.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Blood pressure <[^>]+> mmHg measured\.$/,
      );
    });

    it('should anonymize: cholesterol total 220', async () => {
      const input = 'Cholesterol total 220 mg/dL high.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Cholesterol total <[^>]+> mg\/dL high\.$/,
      );
    });

    it('should anonymize: liver function AST 45', async () => {
      const input = 'Liver function AST 45 U/L noted.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Liver function <[^>]+> U\/L noted\.$/,
      );
    });

    it('should anonymize: kidney function creatinine 1.2', async () => {
      const input = 'Kidney function creatinine 1.2 mg/dL.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Kidney function <[^>]+> mg\/dL\.$/,
      );
    });

    it('should anonymize: TSH level 2.5 mIU/L', async () => {
      const input = 'TSH level 2.5 mIU/L within range.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^TSH level <[^>]+> within range\.$/,
      );
    });

    it('should anonymize: BMI 28.5', async () => {
      const input = 'BMI 28.5 calculated overweight.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^BMI <[^>]+> calculated overweight\.$/,
      );
    });

    it('should anonymize: heart rate 72 bpm', async () => {
      const input = 'Heart rate 72 bpm normal.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Heart rate <[^>]+> normal\.$/);
    });

    it('should anonymize: respiratory rate 16', async () => {
      const input = 'Respiratory rate 16 breaths/min.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Respiratory rate <[^>]+> breaths\/min\.$/,
      );
    });

    it('should anonymize: body temperature 37.5°C', async () => {
      const input = 'Body temperature 37.5°C slight fever.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Body temperature <[^>]+> slight fever\.$/,
      );
    });

    it('should anonymize: oxygen saturation 98%', async () => {
      const input = 'Oxygen saturation 98% SpO2.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Oxygen saturation <[^>]+> SpO2\.$/,
      );
    });

    it('should anonymize: vaccine immunization MMR', async () => {
      const input = 'Vaccine immunization MMR updated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Vaccine immunization <[^>]+> updated\.$/,
      );
    });

    it('should anonymize: allergy penicillin documented', async () => {
      const input = 'Allergy penicillin documented severe.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Allergy <[^>]+> documented severe\.$/,
      );
    });

    it('should anonymize: medication aspirin 81mg', async () => {
      const input = 'Medication aspirin 81mg daily.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Medication <[^>]+> daily\.$/);
    });

    it('should anonymize: prescription lisinopril 10mg', async () => {
      const input = 'Prescription lisinopril 10mg twice daily.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Prescription <[^>]+> twice daily\.$/,
      );
    });

    it('should anonymize: surgical history appendectomy', async () => {
      const input = 'Surgical history appendectomy 2015.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Surgical history <[^>]+> 2015\.$/,
      );
    });

    it('should anonymize: psychiatric evaluation bipolar', async () => {
      const input = 'Psychiatric evaluation bipolar disorder.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Psychiatric evaluation <[^>]+>\.$/,
      );
    });

    it('should anonymize: family history cancer', async () => {
      const input = 'Family history cancer maternal.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Family history <[^>]+> maternal\.$/,
      );
    });

    it('should anonymize: smoking history 20 pack-years', async () => {
      const input = 'Smoking history 20 pack-years quit.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Smoking history <[^>]+> quit\.$/);
    });

    it('should anonymize: alcohol consumption moderate', async () => {
      const input = 'Alcohol consumption moderate intake.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Alcohol consumption <[^>]+> intake\.$/,
      );
    });
  });
};

export default runMedicalTestsGDPR;
