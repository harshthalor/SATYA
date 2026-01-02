FROM hyperledger/fabric-peer:latest

WORKDIR /network

# Copy network configuration files
COPY network/ ./network/
COPY chaincode/ ./chaincode/

# Expose ports
EXPOSE 7051 7054 8080

# Default command (override in docker-compose or provide startup script)
CMD ["peer", "node", "start"]


