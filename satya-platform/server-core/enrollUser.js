const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caInfo.tlsCACerts.pem, verify: false }, caInfo.caName);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // 1. Check if we already have the user (don't repeat if they exist)
        const userIdentity = await wallet.get('appUser');
        if (userIdentity) {
            console.log('✅ appUser already exists in the wallet.');
            return;
        }

        // 2. Check if we have the admin to perform registration
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('❌ Admin not found! Run enrollAdmin.js first.');
            return;
        }
        const newID = 'appUserV3'; // Change this from 'appUser' to 'appUserV3'
        // 3. Build a user object for the admin to interact with the CA
        
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // 4. REGISTER the user (This generates the secret)
        console.log('Registering appUser...');
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'newId',
            role: 'client'
        }, adminUser);

        // 5. ENROLL the user using the secret we just got
        console.log('Enrolling appUserV3...');
        const enrollment = await ca.enroll({
            enrollmentID: 'newId',
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put(newID, x509Identity);
        console.log('✅ Success: appUserV3 registered and enrolled successfully');

    } catch (error) {
        console.error(`❌ Error: ${error}`);
    }
}
main();