import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from 'modules/anonymization/anonymization.service';

const runFinancialTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR financial data anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple financial numbers', async () => {
      const input =
        'My card number used to be 1234 5678 9012 3456, sometimes written as 1234567890123456, and occasionally only shown as **** **** **** 3456, while my bank account might appear as UA123456789012345678901234567 or shortened in different systems.';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^My card number used to be <[^>]+>, sometimes written as <[^>]+>, and occasionally only shown as <[^>]+>, while my bank account might appear as <[^>]+> or shortened in different systems\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: credit card (4111 1111 8294 1111)', async () => {
      const input = 'Card: 4111 1111 8294 1111.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Card: <[^>]+>\.$/);
    });

    it('should anonymize: IBAN (DE89 3704 0044 0532 0130 00)', async () => {
      const input = 'IBAN: DE89 3704 0044 0532 0130 00.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^IBAN: <[^>]+>\.$/);
    });

    it('should anonymize: account number (001-234567-89)', async () => {
      const input = 'Account No: 001-234567-89.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Account No: <[^>]+>\.$/);
    });

    it('should anonymize: SWIFT (BOFAUS3NXXX)', async () => {
      const input = 'SWIFT: BOFAUS3NXXX.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^SWIFT: <[^>]+>\.$/);
    });

    it('should anonymize: not sufficiently masked card (**** 99** 8893 1234)', async () => {
      const input = 'Card ending **** 99** 8893 1234.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Card ending <[^>]+>\.$/);
    });

    it('should anonymize: credit card 4532 1111 5678 9100', async () => {
      const input = 'Card 4532 1111 5678 9100 declined.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Card <[^>]+> declined\.$/);
    });

    it('should anonymize: visa 5567-8910-2345-6789', async () => {
      const input = 'Visa 5567-8910-2345-6789 authorized.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Visa <[^>]+> authorized\.$/);
    });

    it('should anonymize: amex 378282246310005', async () => {
      const input = 'Amex 378282246310005 processed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Amex <[^>]+> processed\.$/);
    });

    it('should anonymize: IBAN DE89 3704 0044 0532 0130 00', async () => {
      const input = 'IBAN DE89 3704 0044 0532 0130 00 saved.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^IBAN <[^>]+> saved\.$/);
    });

    it('should anonymize: SWIFT BOFAUS3NXXX', async () => {
      const input = 'SWIFT BOFAUS3NXXX verified.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^SWIFT <[^>]+> verified\.$/);
    });

    it('should anonymize: bank account 001-234567-89', async () => {
      const input = 'Account 001-234567-89 linked.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Account <[^>]+> linked\.$/);
    });

    it('should anonymize: routing number 021000021', async () => {
      const input = 'Routing 021000021 confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Routing <[^>]+> confirmed\.$/);
    });

    it('should anonymize: masked card **** **** **** 1234', async () => {
      const input = 'Card **** **** **** 1234 on file.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Card <[^>]+> on file\.$/);
    });

    it('should anonymize: CVV 123', async () => {
      const input = 'CVV 123 required.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^CVV <[^>]+> required\.$/);
    });

    it('should anonymize: expiry 12/25', async () => {
      const input = 'Expiry 12/25 valid.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Expiry <[^>]+> valid\.$/);
    });

    it('should anonymize: bitcoin wallet 1A1z7agoat', async () => {
      const input = 'Bitcoin 1A1z7agoat received.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Bitcoin <[^>]+> received\.$/);
    });

    it('should anonymize: ethereum address 0x71C7656EC7ab88b098defB751B7401B5f6d8976F', async () => {
      const input = 'Ethereum 0x71C7656EC7ab88b098defB751B7401B5f6d8976F sent.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Ethereum <[^>]+> sent\.$/);
    });

    it('should anonymize: wire reference WR-777-999', async () => {
      const input = 'Wire WR-777-999 completed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Wire <[^>]+> completed\.$/);
    });

    it('should anonymize: tax ID number 98-7654321', async () => {
      const input = 'Tax ID 98-7654321 recorded.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Tax ID <[^>]+> recorded\.$/);
    });

    it('should anonymize: credit limit $25,000', async () => {
      const input = 'Limit $25,000 approved.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Limit <[^>]+> approved\.$/);
    });

    it('should anonymize: investment account INV-99887766', async () => {
      const input = 'Account INV-99887766 opened.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Account <[^>]+> opened\.$/);
    });

    it('should anonymize: brokerage ID BRKS-555444', async () => {
      const input = 'Brokerage BRKS-555444 confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Brokerage <[^>]+> confirmed\.$/);
    });

    it('should anonymize: payment method PM-11223344', async () => {
      const input = 'Payment PM-11223344 added.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Payment <[^>]+> added\.$/);
    });

    it('should anonymize: paypal email user@paypal.com', async () => {
      const input = 'PayPal user@paypal.com linked.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^PayPal <[^>]+> linked\.$/);
    });

    it('should anonymize: stripe token tok_visa', async () => {
      const input = 'Stripe tok_visa generated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Stripe <[^>]+> generated\.$/);
    });

    it('should anonymize: invoice amount €5,500.00', async () => {
      const input = 'Total €5,500.00 invoiced.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Total <[^>]+> invoiced\.$/);
    });

    it('should anonymize: mortgage number MTG-444555', async () => {
      const input = 'Mortgage MTG-444555 approved.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Mortgage <[^>]+> approved\.$/);
    });

    it('should anonymize: loan identifier LOAN-222333', async () => {
      const input = 'Loan LOAN-222333 disbursed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Loan <[^>]+> disbursed\.$/);
    });

    it('should anonymize: credit score 750', async () => {
      const input = 'Score 750 calculated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Score <[^>]+> calculated\.$/);
    });

    it('should anonymize: transfer reference TRF-BETA789', async () => {
      const input = 'Transfer TRF-BETA789 executed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Transfer <[^>]+> executed\.$/);
    });

    it('should anonymize: direct deposit DDEP-666777', async () => {
      const input = 'Deposit DDEP-666777 scheduled.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Deposit <[^>]+> scheduled\.$/);
    });

    it('should anonymize: ACH routing 031000503', async () => {
      const input = 'ACH 031000503 verified.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^ACH <[^>]+> verified\.$/);
    });

    it('should anonymize: wire amount £12,345.67', async () => {
      const input = 'Amount £12,345.67 transferred.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Amount <[^>]+> transferred\.$/);
    });

    it('should anonymize: chequebook CHQ-888999', async () => {
      const input = 'Cheque CHQ-888999 issued.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Cheque <[^>]+> issued\.$/);
    });

    it('should anonymize: PIN 1234', async () => {
      const input = 'PIN 1234 changed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^PIN <[^>]+> changed\.$/);
    });

    it('should anonymize: balance ¥1,000,000', async () => {
      const input = 'Balance ¥1,000,000 shown.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Balance <[^>]+> shown\.$/);
    });

    it('should anonymize: interest rate 4.25%', async () => {
      const input = 'Rate 4.25% offered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Rate <[^>]+> offered\.$/);
    });

    it('should anonymize: transaction ref TXN-ALPHA001', async () => {
      const input = 'Transaction TXN-ALPHA001 confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Transaction <[^>]+> confirmed\.$/,
      );
    });

    it('should anonymize: card holder name John Doe', async () => {
      const input = 'Holder John Doe verified.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Holder <[^>]+> verified\.$/);
    });

    it('should anonymize: refund amount $199.99', async () => {
      const input = 'Refund $199.99 processed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Refund <[^>]+> processed\.$/);
    });

    it('should anonymize: escrow account ESC-111222', async () => {
      const input = 'Escrow ESC-111222 established.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Escrow <[^>]+> established\.$/);
    });

    it('should anonymize: dividend payment DIV-333444', async () => {
      const input = 'Dividend DIV-333444 distributed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Dividend <[^>]+> distributed\.$/);
    });

    it('should anonymize: insurance premium INS-555', async () => {
      const input = 'Premium INS-555 calculated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Premium <[^>]+> calculated\.$/);
    });
  });
};

export default runFinancialTestsGDPR;
