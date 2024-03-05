require('dotenv').config();
const Web3 = require('web3');
const axios = require('axios');
const solc = require('solc');
const fs = require('fs');

class EtherOps {
    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(process.env.PUBLIC_ENDPOINT_URL));
        this.etherscanApiKey = process.env.ETHERSCAN_API_KEY;
    }

    async getContractSource(contractAddress) {
        const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${this.etherscanApiKey}`;
        try {
            const response = await axios.get(url);
            if (response.data.message === 'OK' && response.data.result[0].SourceCode !== '') {
                return response.data.result[0].SourceCode;
            } else {
                throw new Error('No source code found for this address.');
            }
        } catch (error) {
            console.error('Failed to fetch contract source:', error);
            return null;
        }
    }

    compileContract(sourceCode) {
        const input = {
            language: 'Solidity',
            sources: {
                'Contract.sol': { content: sourceCode },
            },
            settings: { outputSelection: { '*': { '*': ['*'] } } },
        };
        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        return output;
    }

    analyzeGasUsage(compiledContract) {
        // Placeholder: In a real scenario, you would need detailed analysis based on contract bytecode or run simulations
        console.log('Gas usage analysis is a complex task requiring execution or simulation of contract methods.');
    }

    async getTransactionHistory(contractAddress) {
        const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${this.etherscanApiKey}`;
        try {
            const response = await axios.get(url);
            if (response.data.message === 'OK') {
                return response.data.result;
            } else {
                throw new Error('Failed to retrieve transaction history');
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            return null;
        }
    }

    checkForCommonVulnerabilities(sourceCode) {
        const vulnerabilitySignatures = ["call.value(", "send("];
        let vulnerabilityReport = {};

        vulnerabilitySignatures.forEach(signature => {
            vulnerabilityReport[signature] = sourceCode.includes(signature);
        });

        return vulnerabilityReport;
    }

    async analyzeContract(contractAddress) {
        console.log(`Starting analysis for contract at ${contractAddress}...`);

        const sourceCode = await this.getContractSource(contractAddress);
        if (!sourceCode) {
            console.log('Source code not available.');
            return;
        }

        const compiledContract = this.compileContract(sourceCode);
        console.log('Contract compiled successfully.');

        this.analyzeGasUsage(compiledContract);

        const transactionHistory = await this.getTransactionHistory(contractAddress);
        console.log(`${transactionHistory.length} transactions found.`);

        const vulnerabilities = this.checkForCommonVulnerabilities(sourceCode);
        console.log('Vulnerability report:', vulnerabilities);
    }
}

(async () => {
    const etherOps = new EtherOps();
    await etherOps.analyzeContract('0xContractAddress');
})();
