import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from 'modules/anonymization/anonymization.service';

const runOrganizationTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR organization anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple organization names', async () => {
      const input =
        "I work at Global Tech Solutions LLC, or sometimes we shorten it to GTS, though legally it's registered as Global Tech Solutions Limited, and internally we refer to it as “the Group” or just “Head Office.”";

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^I work at <[^>]+>, or sometimes we shorten it to <[^>]+>, though legally it's registered as <[^>]+>, and internally we refer to it as “<[^>]+>” or just “<[^>]+>.”$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: Google', async () => {
      const input = 'I work at Google.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^I work at <[^>]+>\.$/);
    });

    it('should anonymize: Tata Consultancy Services', async () => {
      const input = 'Employed by Tata Consultancy Services.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Employed by <[^>]+>\.$/);
    });

    it('should anonymize: Aramco (Arabic organization)', async () => {
      const input = 'Working for Aramco.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Working for <[^>]+>\.$/);
    });

    it('should anonymize: NHS UK', async () => {
      const input = 'At NHS UK currently.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^At <[^>]+> currently\.$/);
    });

    it('should anonymize: ACME Corp', async () => {
      const input = 'Freelancing via ACME Corp.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Freelancing via <[^>]+>\.$/);
    });

    it('should anonymize: Apple Inc', async () => {
      const input = 'I work at Apple Inc.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^I work at <[^>]+>\.$/);
    });

    it('should anonymize: Samsung Electronics', async () => {
      const input = 'Employed by Samsung Electronics.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Employed by <[^>]+>\.$/);
    });

    it('should anonymize: Toyota Motor Corporation', async () => {
      const input = 'My father works for Toyota Motor Corporation.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^My father works for <[^>]+>\.$/);
    });

    it('should anonymize: Nestlé S.A.', async () => {
      const input = 'I interviewed at Nestlé S.A. last month.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^I interviewed at <[^>]+> last month\.$/,
      );
    });

    it('should anonymize: Volkswagen Group', async () => {
      const input = 'Contracted with Volkswagen Group for the project.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Contracted with <[^>]+> for the project\.$/,
      );
    });

    it('should anonymize: Siemens AG', async () => {
      const input = 'Partnership established with Siemens AG.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Partnership established with <[^>]+>\.$/,
      );
    });

    it('should anonymize: BASF SE', async () => {
      const input = 'Chemical supplies from BASF SE arrived today.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Chemical supplies from <[^>]+> arrived today\.$/,
      );
    });

    it('should anonymize: BMW AG', async () => {
      const input = 'Dealership franchise from BMW AG.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Dealership franchise from <[^>]+>\.$/,
      );
    });

    it('should anonymize: Zurich Insurance Group', async () => {
      const input = 'Policy holder with Zurich Insurance Group.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Policy holder with <[^>]+>\.$/);
    });

    it('should anonymize: Allianz SE', async () => {
      const input = 'Coverage through Allianz SE is excellent.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Coverage through <[^>]+> is excellent\.$/,
      );
    });

    it('should anonymize: Gazprom', async () => {
      const input = 'Energy contract with Gazprom finalized.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Energy contract with <[^>]+> finalized\.$/,
      );
    });

    it('should anonymize: Rosneft', async () => {
      const input = 'Supply agreement from Rosneft approved.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Supply agreement from <[^>]+> approved\.$/,
      );
    });

    it('should anonymize: Lukoil', async () => {
      const input = 'Investment opportunity with Lukoil explored.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Investment opportunity with <[^>]+> explored\.$/,
      );
    });

    it('should anonymize: Yandex', async () => {
      const input = 'Tech partnership with Yandex announced.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Tech partnership with <[^>]+> announced\.$/,
      );
    });

    it('should anonymize: Sberbank', async () => {
      const input = 'Banking services from Sberbank utilized.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Banking services from <[^>]+> utilized\.$/,
      );
    });

    it('should anonymize: Huawei Technologies', async () => {
      const input = 'Equipment supplied by Huawei Technologies.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Equipment supplied by <[^>]+>\.$/,
      );
    });

    it('should anonymize: Alibaba Group', async () => {
      const input = 'Marketplace integration with Alibaba Group.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Marketplace integration with <[^>]+>\.$/,
      );
    });

    it('should anonymize: Tencent Holdings', async () => {
      const input = 'Digital services from Tencent Holdings licensed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Digital services from <[^>]+> licensed\.$/,
      );
    });

    it('should anonymize: State Bank of India', async () => {
      const input = 'Account opened at State Bank of India.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Account opened at <[^>]+>\.$/);
    });

    it('should anonymize: Reliance Industries', async () => {
      const input = 'Joint venture with Reliance Industries initiated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Joint venture with <[^>]+> initiated\.$/,
      );
    });

    it('should anonymize: Infosys Limited', async () => {
      const input = 'Consulting services from Infosys Limited retained.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Consulting services from <[^>]+> retained\.$/,
      );
    });

    it('should anonymize: Wipro Technologies', async () => {
      const input = 'Software development by Wipro Technologies completed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Software development by <[^>]+> completed\.$/,
      );
    });

    it('should anonymize: Kirloskar Group', async () => {
      const input = 'Industrial equipment from Kirloskar Group delivered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Industrial equipment from <[^>]+> delivered\.$/,
      );
    });

    it('should anonymize: Hero MotoCorp', async () => {
      const input = 'Motorcycle purchased from Hero MotoCorp dealership.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Motorcycle purchased from <[^>]+> dealership\.$/,
      );
    });

    it('should anonymize: Mahindra & Mahindra', async () => {
      const input = 'Vehicle maintenance at Mahindra & Mahindra facility.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Vehicle maintenance at <[^>]+> facility\.$/,
      );
    });

    it('should anonymize: Petrobras', async () => {
      const input = 'Fuel supply contract with Petrobras signed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Fuel supply contract with <[^>]+> signed\.$/,
      );
    });

    it('should anonymize: Vale S.A.', async () => {
      const input = 'Mining operations managed by Vale S.A.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Mining operations managed by <[^>]+>\.$/,
      );
    });

    it('should anonymize: Itaú Unibanco', async () => {
      const input = 'Mortgage approved by Itaú Unibanco.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Mortgage approved by <[^>]+>\.$/);
    });

    it('should anonymize: JBS S.A.', async () => {
      const input = 'Meat supplier JBS S.A. provides quality products.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Meat supplier <[^>]+> provides quality products\.$/,
      );
    });

    it('should anonymize: Embraer', async () => {
      const input = 'Aircraft manufactured by Embraer delivered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Aircraft manufactured by <[^>]+> delivered\.$/,
      );
    });

    it('should anonymize: Natura &Co', async () => {
      const input = 'Beauty products from Natura &Co purchased.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Beauty products from <[^>]+> purchased\.$/,
      );
    });

    it('should anonymize: Bradespa', async () => {
      const input = 'Pulp supplier Bradespa confirmed delivery.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Pulp supplier <[^>]+> confirmed delivery\.$/,
      );
    });

    it('should anonymize: Keurig Dr Pepper', async () => {
      const input = 'Beverage distributor Keurig Dr Pepper restocked.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Beverage distributor <[^>]+> restocked\.$/,
      );
    });

    it('should anonymize: Grupo Antolin', async () => {
      const input = 'Auto parts supplied by Grupo Antolin.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Auto parts supplied by <[^>]+>\.$/,
      );
    });

    it('should anonymize: Mapfre Insurance', async () => {
      const input = 'Coverage renewed with Mapfre Insurance.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Coverage renewed with <[^>]+>\.$/,
      );
    });

    it('should anonymize: Grupo Bancario Santander', async () => {
      const input = 'Investment account managed by Grupo Bancario Santander.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Investment account managed by <[^>]+>\.$/,
      );
    });

    it('should anonymize: Mercado Libre', async () => {
      const input = 'Auction listing posted on Mercado Libre.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Auction listing posted on <[^>]+>\.$/,
      );
    });

    it('should anonymize: Grupo Mexico', async () => {
      const input = 'Mining concession granted to Grupo Mexico.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Mining concession granted to <[^>]+>\.$/,
      );
    });

    it('should anonymize: Cemex SAB', async () => {
      const input = 'Cement orders placed with Cemex SAB.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Cement orders placed with <[^>]+>\.$/,
      );
    });
  });
};

export default runOrganizationTestsGDPR;
