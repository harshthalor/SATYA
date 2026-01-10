# Fix Chaincode Deployment "Broken Pipe" Error

## Problem
```
Error: chaincode install failed with status: 500 - failed to invoke backing implementation of 'InstallChaincode': could not build chaincode: docker build failed: docker image build failed: write unix @->/run/host-services/docker.proxy.sock: write: broken pipe
```

## Solutions (Try in order)

### Solution 1: Retry the Deployment
The error is often transient. Simply retry:
```bash
cd satya-chaincode/test-network
./network.sh deployCC -ccn satya -ccp ../satya-chaincode -ccl go -c satya
```

### Solution 2: Restart Docker Desktop
1. Quit Docker Desktop completely
2. Restart Docker Desktop
3. Wait for it to fully start
4. Retry the deployment command

### Solution 3: Clean Up and Retry
```bash
cd satya-chaincode/test-network

# Remove old chaincode package
rm -f satya.tar.gz

# Clean Docker build cache (optional)
docker builder prune -f

# Retry deployment
./network.sh deployCC -ccn satya -ccp ../satya-chaincode -ccl go -c satya
```

### Solution 4: Increase Docker Desktop Resources
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase:
   - Memory: At least 4GB (8GB recommended)
   - CPUs: At least 2 cores
4. Apply & Restart
5. Retry deployment

### Solution 5: Check Docker Desktop Logs
```bash
# Check if Docker is having issues
docker info

# Check peer logs
docker logs peer0.org1.example.com | tail -20
```

### Solution 6: Manual Chaincode Installation (Advanced)
If automatic deployment keeps failing, you can try manual installation:
```bash
cd satya-chaincode/test-network

# Package chaincode
peer lifecycle chaincode package satya.tar.gz \
  --path ../satya-chaincode \
  --lang golang \
  --label satya_1.0

# Install on peer0.org1
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install satya.tar.gz
```

## Common Causes
1. **Docker Desktop resource limits** - Not enough memory/CPU
2. **Network timeout** - Slow connection during build
3. **Docker daemon issues** - Docker Desktop needs restart
4. **Large build context** - Vendor directory too large (18MB is fine)

## Verification
After successful deployment, verify:
```bash
# Check installed chaincodes
peer lifecycle chaincode queryinstalled

# Check committed chaincodes
peer lifecycle chaincode querycommitted --channelID satya
```



