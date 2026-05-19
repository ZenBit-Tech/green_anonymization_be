import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from 'modules/anonymization/anonymization.service';

const runIdentifierTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR identifier anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple identifiers', async () => {
      const input =
        'My passport number is AB123456, though some forms list it as AB-123456 or just 123456 with prefix AB, and my internal ID is 000987654, sometimes shortened to 987654 or written as ID#987654.';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^My passport number is <[^>]+>, though some forms list it as <[^>]+> or just <[^>]+> with prefix <[^>]+>, and my internal ID is <[^>]+>, sometimes shortened to <[^>]+> or written as <[^>]+>\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: ID (AB-123456)', async () => {
      const input = 'ID: AB-123456.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^ID: <[^>]+>\.$/);
    });

    it('should anonymize: reference number (XYZ-999-888)', async () => {
      const input = 'Ref number (XYZ-999-888).';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Ref number \(<[^>]+>\)\.$/);
    });

    it('should anonymize: user ID (ID:778899)', async () => {
      const input = 'User ID [ID:778899].';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^User ID \[<[^>]+>\]\.$/);
    });

    it('should anonymize: code (12-34-56-78)', async () => {
      const input = 'Code: 12-34-56-78.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Code: <[^>]+>\.$/);
    });

    it('should anonymize: token ({A1B2-C3D4})', async () => {
      const input = 'Token {A1B2-C3D4}.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Token \{<[^>]+>\}\.$/);
    });

    it('should anonymize: passport AB-123456', async () => {
      const input = 'Passport AB-123456 verified.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Passport <[^>]+> verified\.$/);
    });

    it('should anonymize: driver license DL-789012', async () => {
      const input = 'Driver license DL-789012 scanned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Driver license <[^>]+> scanned\.$/,
      );
    });

    it('should anonymize: employee ID EMP-456789', async () => {
      const input = 'Employee ID EMP-456789 logged in.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Employee ID <[^>]+> logged in\.$/,
      );
    });

    it('should anonymize: national ID 12345678-A', async () => {
      const input = 'National ID 12345678-A confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^National ID <[^>]+> confirmed\.$/,
      );
    });

    it('should anonymize: student number 2024001234', async () => {
      const input = 'Student number 2024001234 enrolled.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Student number <[^>]+> enrolled\.$/,
      );
    });

    it('should anonymize: patient record PRN-99887766', async () => {
      const input = 'Patient record PRN-99887766 updated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Patient record <[^>]+> updated\.$/,
      );
    });

    it('should anonymize: reference REF-2024-12345', async () => {
      const input = 'Reference REF-2024-12345 processed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Reference <[^>]+> processed\.$/);
    });

    it('should anonymize: license plate ABC-1234-XYZ', async () => {
      const input = 'License plate ABC-1234-XYZ noted.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^License plate <[^>]+> noted\.$/);
    });

    it('should anonymize: insurance policy POL-555444333', async () => {
      const input = 'Insurance policy POL-555444333 active.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Insurance policy <[^>]+> active\.$/,
      );
    });

    it('should anonymize: social security number', async () => {
      const input = 'SSN XXX-XX-1234 masked partially.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^SSN <[^>]+> masked partially\.$/);
    });

    it('should anonymize: tax ID TID-98765432', async () => {
      const input = 'Tax ID TID-98765432 filed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Tax ID <[^>]+> filed\.$/);
    });

    it('should anonymize: case number CASE-2024-001122', async () => {
      const input = 'Case number CASE-2024-001122 opened.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Case number <[^>]+> opened\.$/);
    });

    it('should anonymize: voucher VCH-77889900', async () => {
      const input = 'Voucher VCH-77889900 redeemed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Voucher <[^>]+> redeemed\.$/);
    });

    it('should anonymize: serial number SN-2024-5678-ABCD', async () => {
      const input = 'Serial number SN-2024-5678-ABCD registered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Serial number <[^>]+> registered\.$/,
      );
    });

    it('should anonymize: order ID ORD-999-111-222', async () => {
      const input = 'Order ID ORD-999-111-222 shipped.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Order ID <[^>]+> shipped\.$/);
    });

    it('should anonymize: account number ACC-44556677', async () => {
      const input = 'Account number ACC-44556677 verified.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Account number <[^>]+> verified\.$/,
      );
    });

    it('should anonymize: registration number REG-88776655', async () => {
      const input = 'Registration number REG-88776655 approved.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Registration number <[^>]+> approved\.$/,
      );
    });

    it('should anonymize: membership MEM-2024-99999', async () => {
      const input = 'Membership MEM-2024-99999 activated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Membership <[^>]+> activated\.$/);
    });

    it('should anonymize: certificate CERT-ABC123XYZ', async () => {
      const input = 'Certificate CERT-ABC123XYZ issued.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Certificate <[^>]+> issued\.$/);
    });

    it('should anonymize: authorization code AUTH-777-888-999', async () => {
      const input = 'Authorization code AUTH-777-888-999 sent.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Authorization code <[^>]+> sent\.$/,
      );
    });

    it('should anonymize: batch number BTH-20240515', async () => {
      const input = 'Batch number BTH-20240515 received.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Batch number <[^>]+> received\.$/,
      );
    });

    it('should anonymize: tracking number TRK-1234567890', async () => {
      const input = 'Tracking number TRK-1234567890 available.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Tracking number <[^>]+> available\.$/,
      );
    });

    it('should anonymize: permit number PRM-66554433', async () => {
      const input = 'Permit number PRM-66554433 granted.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Permit number <[^>]+> granted\.$/,
      );
    });

    it('should anonymize: invoice number INV-2024-005555', async () => {
      const input = 'Invoice number INV-2024-005555 issued.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Invoice number <[^>]+> issued\.$/,
      );
    });

    it('should anonymize: vendor ID VEND-112233', async () => {
      const input = 'Vendor ID VEND-112233 approved.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Vendor ID <[^>]+> approved\.$/);
    });

    it('should anonymize: shipment number SHIP-AAA-BBB-CCC', async () => {
      const input = 'Shipment number SHIP-AAA-BBB-CCC confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Shipment number <[^>]+> confirmed\.$/,
      );
    });

    it('should anonymize: product code PRD-777888999', async () => {
      const input = 'Product code PRD-777888999 scanned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Product code <[^>]+> scanned\.$/);
    });

    it('should anonymize: contract number CTR-2024-1111', async () => {
      const input = 'Contract number CTR-2024-1111 signed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Contract number <[^>]+> signed\.$/,
      );
    });

    it('should anonymize: booking reference BKG-ALPHA123', async () => {
      const input = 'Booking reference BKG-ALPHA123 confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Booking reference <[^>]+> confirmed\.$/,
      );
    });

    it('should anonymize: tenant ID TENT-555666777', async () => {
      const input = 'Tenant ID TENT-555666777 registered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Tenant ID <[^>]+> registered\.$/);
    });

    it('should anonymize: route number RTE-88899900', async () => {
      const input = 'Route number RTE-88899900 assigned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Route number <[^>]+> assigned\.$/,
      );
    });

    it('should anonymize: claim number CLM-2024-333333', async () => {
      const input = 'Claim number CLM-2024-333333 filed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Claim number <[^>]+> filed\.$/);
    });

    it('should anonymize: ticket ID TKT-999-888-777', async () => {
      const input = 'Ticket ID TKT-999-888-777 issued.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Ticket ID <[^>]+> issued\.$/);
    });

    it('should anonymize: project code PROJ-DELTA456', async () => {
      const input = 'Project code PROJ-DELTA456 launched.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Project code <[^>]+> launched\.$/,
      );
    });

    it('should anonymize: appointment ID APT-20240620', async () => {
      const input = 'Appointment ID APT-20240620 scheduled.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Appointment ID <[^>]+> scheduled\.$/,
      );
    });

    it('should anonymize: release number REL-v2.5.1-GAMMA', async () => {
      const input = 'Release number REL-v2.5.1-GAMMA deployed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Release number <[^>]+> deployed\.$/,
      );
    });

    it('should anonymize: session ID SESS-BETA-555', async () => {
      const input = 'Session ID SESS-BETA-555 active.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Session ID <[^>]+> active\.$/);
    });
  });
};

export default runIdentifierTestsGDPR;
