import { Compliance } from '../../../src/common/constants';
import AnonymizationService from '../../../src/modules/anonymization/anonymization.service';

const runBiometricTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR biometric data anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple biometric data types', async () => {
      const input =
        'My profile includes a face image file IMG_20230101_123456.jpg, a facial embedding vector [0.123, -0.987, 0.456, ...], fingerprint template FMR-1234-5678-ABCD, and retina scan ID RET-99887766, all linked to biometric record BIO-ID-445566.';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^My profile includes a face image file <[^>]+>, a facial embedding vector <[^>]+>, fingerprint template <[^>]+>, and retina scan <[^>]+>, all linked to biometric record <[^>]+>\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: fingerprint (FMR-9988-7766)', async () => {
      const input = 'Fingerprint ID FMR-9988-7766.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Fingerprint ID <[^>]+>\.$/);
    });

    it('should anonymize: face vector ([0.12, 0.98, -0.45])', async () => {
      const input = 'Face ID vector [0.12, 0.98, -0.45].';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Face ID vector <[^>]+>\.$/);
    });

    it('should anonymize: voiceprint (VP-ABC-999)', async () => {
      const input = 'Voiceprint hash VP-ABC-999.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Voiceprint hash <[^>]+>\.$/);
    });

    it('should anonymize: biometric record (BIO-777888)', async () => {
      const input = 'Biometric record BIO-777888.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Biometric record <[^>]+>\.$/);
    });

    it('should anonymize: fingerprint FMR-12345-ABCD', async () => {
      const input = 'Fingerprint FMR-12345-ABCD enrolled.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Fingerprint <[^>]+> enrolled\.$/);
    });

    it('should anonymize: face recognition data', async () => {
      const input = 'Face recognition data collected.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> collected\.$/);
    });

    it('should anonymize: retina pattern RET-99887766', async () => {
      const input = 'Retina pattern RET-99887766 verified.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> verified\.$/);
    });

    it('should anonymize: voiceprint VP-VOICE-001', async () => {
      const input = 'Voiceprint VP-VOICE-001 matched.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> matched\.$/);
    });

    it('should anonymize: facial embedding vector', async () => {
      const input = 'Facial embedding vector [0.12, -0.45, 0.78] processed.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Facial embedding vector <[^>]+> processed\.$/,
      );
    });

    it('should anonymize: gait recognition pattern', async () => {
      const input = 'Gait recognition pattern analyzed.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> analyzed\.$/);
    });

    it('should anonymize: palmprint scan PALM-555', async () => {
      const input = 'Palmprint scan PALM-555 registered.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> registered\.$/);
    });

    it('should anonymize: heartbeat pattern HR-PATTERN', async () => {
      const input = 'Heartbeat pattern HR-PATTERN recorded.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> recorded\.$/);
    });

    it('should anonymize: DNA profile DNA-SEQ-123', async () => {
      const input = 'DNA profile DNA-SEQ-123 analyzed.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> analyzed\.$/);
    });

    it('should anonymize: hand geometry HG-DIMS', async () => {
      const input = 'Hand geometry HG-DIMS captured.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> captured\.$/);
    });

    it('should anonymize: typing pattern keystroke', async () => {
      const input = 'Typing pattern keystroke analyzed.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> analyzed\.$/);
    });

    it('should anonymize: ear shape biometric', async () => {
      const input = 'Ear shape biometric EAR-001.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+>\.$/);
    });

    it('should anonymize: vein recognition VR-PATTERN', async () => {
      const input = 'Vein recognition VR-PATTERN matched.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> matched\.$/);
    });

    it('should anonymize: tongue print TP-SCAN', async () => {
      const input = 'Tongue print TP-SCAN registered.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> registered\.$/);
    });

    it('should anonymize: behavioral biometric behavior', async () => {
      const input = 'Behavioral biometric behavior recorded.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> recorded\.$/);
    });

    it('should anonymize: facial geometry FG-COORDS', async () => {
      const input = 'Facial geometry FG-COORDS measured.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> measured\.$/);
    });

    it('should anonymize: thermal signature THERMAL-001', async () => {
      const input = 'Thermal signature THERMAL-001 detected.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> detected\.$/);
    });

    it('should anonymize: body odor chemical', async () => {
      const input = 'Body odor chemical signature mapped.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> mapped\.$/);
    });

    it('should anonymize: EEG brainwave pattern', async () => {
      const input = 'EEG brainwave pattern recorded.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> recorded\.$/);
    });

    it('should anonymize: biometric template BIO-TEMP-99', async () => {
      const input = 'Biometric template BIO-TEMP-99 stored.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> stored\.$/);
    });

    it('should anonymize: face image file IMG_FACE_001.jpg', async () => {
      const input = 'Face image file IMG_FACE_001.jpg archived.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Face image file <[^>]+> archived\.$/,
      );
    });

    it('should anonymize: fingerprint image FP_SCAN_001.tif', async () => {
      const input = 'Fingerprint image FP_SCAN_001.tif saved.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Fingerprint image <[^>]+> saved\.$/,
      );
    });

    it('should anonymize: iris image file IRIS_001.png', async () => {
      const input = 'Iris image file IRIS_001.png stored.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Iris image file <[^>]+> stored\.$/,
      );
    });

    it('should anonymize: video recording VID-BIO-001', async () => {
      const input = 'Video recording VID-BIO-001 captured.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> captured\.$/);
    });

    it('should anonymize: voice recording VOICE-001.wav', async () => {
      const input = 'Voice recording VOICE-001.wav encoded.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> encoded\.$/);
    });

    it('should anonymize: biometric ID BIO-ID-777', async () => {
      const input = 'Biometric ID BIO-ID-777 generated.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> generated\.$/);
    });

    it('should anonymize: enrollment record ENR-BIO-2024', async () => {
      const input = 'Enrollment record ENR-BIO-2024 created.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> created\.$/);
    });

    it('should anonymize: matching score match-98.5%', async () => {
      const input = 'Matching score match-98.5% achieved.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> achieved\.$/);
    });

    it('should anonymize: authentication token AUTH-BIO-001', async () => {
      const input = 'Authentication token AUTH-BIO-001 issued.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> issued\.$/);
    });

    it('should anonymize: biometric device id DEVICE-BIO-555', async () => {
      const input = 'Biometric device id DEVICE-BIO-555 registered.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> registered\.$/);
    });

    it('should anonymize: sensor calibration CAL-SENSOR-001', async () => {
      const input = 'Sensor calibration CAL-SENSOR-001 verified.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> verified\.$/);
    });

    it('should anonymize: quality score quality-85', async () => {
      const input = 'Quality score quality-85 acceptable.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> acceptable\.$/);
    });

    it('should anonymize: false rejection rate FRR-0.01%', async () => {
      const input = 'False rejection rate FRR-0.01% recorded.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> recorded\.$/);
    });

    it('should anonymize: false acceptance rate FAR-0.001%', async () => {
      const input = 'False acceptance rate FAR-0.001% measured.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> measured\.$/);
    });

    it('should anonymize: biometric database entry DB-BIO-444', async () => {
      const input = 'Biometric database entry DB-BIO-444 updated.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> updated\.$/);
    });

    it('should anonymize: template extraction process', async () => {
      const input = 'Template extraction process completed.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> completed\.$/);
    });

    it('should anonymize: feature vector FV-EXTRACT', async () => {
      const input = 'Feature vector FV-EXTRACT generated.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> generated\.$/);
    });

    it('should anonymize: encryption key ENC-BIO-KEY', async () => {
      const input = 'Encryption key ENC-BIO-KEY secured.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> secured\.$/);
    });

    it('should anonymize: backup data BACKUP-BIO-2024', async () => {
      const input = 'Backup data BACKUP-BIO-2024 archived.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^<[^>]+> archived\.$/);
    });
  });
};

export default runBiometricTestsGDPR;
