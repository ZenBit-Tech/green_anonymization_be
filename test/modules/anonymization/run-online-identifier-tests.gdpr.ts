import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from '../../../src/modules/anonymization/anonymization.service';

const runOnlineIdentifierTestsGDPR = (
  getService: () => AnonymizationService,
) => {
  describe('GDPR online identifier anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple online/network identifiers', async () => {
      const input =
        'My IP could be 192.168.1.1 locally, or 203.0.113.45 externally, sometimes logged as 203.0.113.xxx, and my device might appear as iPhone-13-Alex, Alex’s iPhone, or device ID A1B2C3D4.';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^My IP could be <[^>]+> locally, or <[^>]+> externally, sometimes logged as <[^>]+>, and my device might appear as <[^>]+>, <[^>]+>, or device ID <[^>]+>\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: public IP (8.8.8.8)', async () => {
      const input = 'IP is 8.8.8.8.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^IP is <[^>]+>\.$/);
    });

    it('should anonymize: private IP (192.168.0.1)', async () => {
      const input = 'Local IP 192.168.0.1 used.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Local IP <[^>]+> used\.$/);
    });

    it('should anonymize: device (Samsung-Galaxy-S21)', async () => {
      const input = 'Device: Samsung-Galaxy-S21.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Device: <[^>]+>\.$/);
    });

    it('should anonymize: IPv6 (fe80::1ff:fe23:4567:890a)', async () => {
      const input = 'Session from fe80::1ff:fe23:4567:890a.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Session from <[^>]+>\.$/);
    });

    it('should anonymize: user agent ID (UA-123456-7)', async () => {
      const input = 'User agent ID UA-123456-7.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^User agent ID <[^>]+>\.$/);
    });

    it('should anonymize: IPv4 192.168.1.1', async () => {
      const input = 'Local IP 192.168.1.1 detected.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Local IP <[^>]+> detected\.$/);
    });

    it('should anonymize: IPv4 8.8.8.8', async () => {
      const input = 'DNS server 8.8.8.8 configured.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^DNS server <[^>]+> configured\.$/,
      );
    });

    it('should anonymize: IPv6 fe80::1', async () => {
      const input = 'Link-local fe80::1 assigned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Link-local <[^>]+> assigned\.$/);
    });

    it('should anonymize: IPv6 2001:db8::1', async () => {
      const input = 'IPv6 2001:db8::1 routed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^IPv6 <[^>]+> routed\.$/);
    });

    it('should anonymize: MAC address 00:1A:2B:3C:4D:5E', async () => {
      const input = 'MAC 00:1A:2B:3C:4D:5E identified.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^MAC <[^>]+> identified\.$/);
    });

    it('should anonymize: device UUID 550e8400-e29b-41d4', async () => {
      const input = 'Device ID 550e8400-e29b-41d4 registered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Device ID <[^>]+> registered\.$/);
    });

    it('should anonymize: UDID 8e4e14e8c3614f6d9b8f0e9c7d7a2c1f', async () => {
      const input = 'UDID 8e4e14e8c3614f6d9b8f0e9c7d7a2c1f bound.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^UDID <[^>]+> bound\.$/);
    });

    it('should anonymize: IMEI 123456789012345', async () => {
      const input = 'IMEI 123456789012345 verified.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^IMEI <[^>]+> verified\.$/);
    });

    it('should anonymize: IMSI 310150123456789', async () => {
      const input = 'IMSI 310150123456789 provisioned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^IMSI <[^>]+> provisioned\.$/);
    });

    it('should anonymize: hostname server-prod-01', async () => {
      const input = 'Host server-prod-01 available.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Host <[^>]+> available\.$/);
    });

    it('should anonymize: domain example.com', async () => {
      const input = 'Domain example.com registered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Domain <[^>]+> registered\.$/);
    });

    it('should anonymize: subdomain api.service.local', async () => {
      const input = 'Subdomain api.service.local resolved.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Subdomain <[^>]+> resolved\.$/);
    });

    it('should anonymize: user agent Mozilla/5.0', async () => {
      const input = 'Agent Mozilla/5.0 logged.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Agent <[^>]+> logged\.$/);
    });

    it('should anonymize: session ID sess_abc123xyz', async () => {
      const input = 'Session sess_abc123xyz created.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Session <[^>]+> created\.$/);
    });

    it('should anonymize: cookie name tracking_id', async () => {
      const input = 'Cookie tracking_id set.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Cookie <[^>]+> set\.$/);
    });

    it('should anonymize: fingerprint hash 3d4f5e6d7c8b9a0f', async () => {
      const input = 'Print 3d4f5e6d7c8b9a0f matched.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Print <[^>]+> matched\.$/);
    });

    it('should anonymize: API key sk_live_abc123def456', async () => {
      const input = 'Key sk_live_abc123def456 configured.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Key <[^>]+> configured\.$/);
    });

    it('should anonymize: OAuth token oauth2_token_xyz', async () => {
      const input = 'Token oauth2_token_xyz obtained.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Token <[^>]+> obtained\.$/);
    });

    it('should anonymize: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', async () => {
      const input = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 decoded.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^JWT <[^>]+> decoded\.$/);
    });

    it('should anonymize: device name iPhone-Pro-Max', async () => {
      const input = 'Device iPhone-Pro-Max paired.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Device <[^>]+> paired\.$/);
    });

    it('should anonymize: browser fingerprint BROWSER_FP_789', async () => {
      const input = 'Fingerprint BROWSER_FP_789 detected.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Fingerprint <[^>]+> detected\.$/);
    });

    it('should anonymize: advertising ID AAID-12345', async () => {
      const input = 'Ad ID AAID-12345 available.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Ad ID <[^>]+> available\.$/);
    });

    it('should anonymize: merchant account MID-999888', async () => {
      const input = 'MID MID-999888 activated.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^MID <[^>]+> activated\.$/);
    });

    it('should anonymize: terminal ID TID-555666', async () => {
      const input = 'Terminal TID-555666 connected.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Terminal <[^>]+> connected\.$/);
    });

    it('should anonymize: VPN address vpn.company.net', async () => {
      const input = 'VPN vpn.company.net connected.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^VPN <[^>]+> connected\.$/);
    });

    it('should anonymize: proxy server proxy-lb-01', async () => {
      const input = 'Proxy proxy-lb-01 configured.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Proxy <[^>]+> configured\.$/);
    });

    it('should anonymize: WiFi SSID NetworkName5G', async () => {
      const input = 'SSID NetworkName5G found.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^SSID <[^>]+> found\.$/);
    });

    it('should anonymize: Bluetooth address 5C:F3:70:8D:9C:2A', async () => {
      const input = 'Bluetooth 5C:F3:70:8D:9C:2A discovered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Bluetooth <[^>]+> discovered\.$/);
    });

    it('should anonymize: NFC tag NFC-CARD-001', async () => {
      const input = 'Tag NFC-CARD-001 scanned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Tag <[^>]+> scanned\.$/);
    });

    it('should anonymize: RFID identifier RFID-EPC-9999', async () => {
      const input = 'RFID RFID-EPC-9999 detected.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^RFID <[^>]+> detected\.$/);
    });

    it('should anonymize: App ID com.example.app', async () => {
      const input = 'App com.example.app launched.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^App <[^>]+> launched\.$/);
    });

    it('should anonymize: bundle ID bundle-app-12345', async () => {
      const input = 'Bundle bundle-app-12345 registered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Bundle <[^>]+> registered\.$/);
    });

    it('should anonymize: installation ID inst-uuid-long', async () => {
      const input = 'Install inst-uuid-long tracked.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Install <[^>]+> tracked\.$/);
    });

    it('should anonymize: port number 8443', async () => {
      const input = 'Port 8443 listening.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Port <[^>]+> listening\.$/);
    });

    it('should anonymize: service port ssh-22', async () => {
      const input = 'Service ssh-22 running.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Service <[^>]+> running\.$/);
    });

    it('should anonymize: subscriber ID sub-xyz-789', async () => {
      const input = 'Subscriber sub-xyz-789 active.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Subscriber <[^>]+> active\.$/);
    });

    it('should anonymize: connection string srv-db-prod', async () => {
      const input = 'Connection srv-db-prod established.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Connection <[^>]+> established\.$/,
      );
    });

    it('should anonymize: cluster node node-11-replica', async () => {
      const input = 'Node node-11-replica joined.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Node <[^>]+> joined\.$/);
    });

    it('should anonymize: virtual machine vm-instance-99', async () => {
      const input = 'VM vm-instance-99 deployed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^VM <[^>]+> deployed\.$/);
    });
  });
};

export default runOnlineIdentifierTestsGDPR;
