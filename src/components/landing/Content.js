import Title from 'components/landing/Title';
import ContactCard from 'components/landing/ContactCard';
import Form from 'components/landing/Form';
import { useEthers, useEtherBalance } from "@usedapp/core";
import { formatEther, parseEther} from "@ethersproject/units";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactJson from 'react-json-view';
import Button from '@material-tailwind/react/Button';

function sumValue(array){
    let sum = 0
    for (let i = 0; i < array.length; i++) {
        sum += Number(array[i].value);
    }
    return sum;
}

export default function Content() {
    const naffContractAPI = 'https://api.uat.naffiti.com/api/v1/contract?chain_id='
    const { activateBrowserWallet, account, chainId } = useEthers();
    const etherBalance = useEtherBalance(account);
    const [tokenDetails, setTokenDetails] = useState([])
    const [transactionDetails, setTransactionDetails] = useState([])
    const [transactionsNo, setTransactionsNo] = useState(0)
    const [gasUsed, setGasUsed] = useState(0)
    const [naftaPrice, setNaftaPrice] = useState(0)
    const [otherPrice, setOtherPrice] = useState(0)
    const [naftaBought, setNaftaBought] = useState(0)
    const [otherBought, setOtherBought] = useState(0)
    function handleConnectWallet() {
      activateBrowserWallet();
    }
    const defaultAddress='0x7ebBdA87448f22b1B64f19C0312a8F827b85615f'
    useEffect(() => {
        if (account) {
            const link = "https://api.etherscan.io/api?module=account&action=tokennfttx&address="+account+"&page=1&offset=100&startblock=0&sort=asc&apikey=VS6SCTIDV6KB3PJDYNF8CU19SV6UW3SUB6"
            axios.get(link).then((resp)=>{
                console.log(resp);
                setTokenDetails(resp.data.result)
                const link2 = "https://api.etherscan.io/api?module=account&action=txlist&address="+account+"&page=1&offset=100&startblock=0&sort=asc&apikey=VS6SCTIDV6KB3PJDYNF8CU19SV6UW3SUB6"
                axios.get(link2).then((resp)=>{
                    console.log(resp);
                    setTransactionDetails(resp.data.result)
                }).catch((error)=>{
                    console.log('error')
                })
            }).catch((error)=>{
                console.log('error')
            })
            
        }
    }, [account]);
    useEffect(() => {
        if (account) {
            axios.get(naffContractAPI+chainId).then((resp)=>{
                const naftaTokens = tokenDetails.filter(a => a.contractAddress === resp.data.ERC721);
                const otherTokens = tokenDetails.filter(a => a.contractAddress !== resp.data.ERC721);
                let naftaPricen = 0;
                let otherPricen = 0;
                for (let i = 0; i < naftaTokens.length; i++) {
                    naftaPricen += sumValue(transactionDetails.filter(a => a.hash === naftaTokens[i].hash))
                }
                for (let i = 0; i < otherTokens.length; i++) {
                    otherPricen += sumValue(transactionDetails.filter(a => a.hash === otherTokens[i].hash))
                }

                let gasUsedn = 0;
                for (let i = 0; i < transactionDetails.length; i++) {
                    gasUsedn += Number(transactionDetails[i].gasUsed)
                }
                setNaftaBought(naftaTokens.length);
                setOtherBought(otherTokens.length)
                setTransactionsNo(transactionDetails.length);
                setGasUsed(formatEther(gasUsedn))
                setNaftaPrice(naftaPricen)
                setOtherPrice(otherPricen)
            })
        }
    }, [chainId, transactionDetails]);
    
    return (
        <section className="pb-20 relative block bg-gray-100">
            <div className="container max-w-7xl mx-auto px-4 lg:pt-24">
                
                <Title heading={account ? 'Connected' : 'Not Connected'}>
                    {account ? null : <Button
                            onClick={handleConnectWallet}
                        >
                            Connect to a wallet
                        </Button>
                    }
                </Title>
                <div className="flex flex-wrap -mt-12 justify-center">
                    <ContactCard icon="stars" title="Naftaverse Marketplaces">
                        <div className="justify-left" style={{textAlign:'left'}}>
                            <p>{naftaBought} NFTs Purchased</p>
                            <p>{naftaPrice}{naftaPrice===0?'':'^18'} ETH Spent</p>
                            {/* <p>NAFF transactions</p>
                            <p>NAFF Spent</p>
                            <p>Other transactions</p>
                            <p>Others Spent</p> */}
                            {/* <p>{gasUsed} Gas Used</p> */}
                        </div>
                    </ContactCard>
                    <ContactCard icon="insert_chart" title="Other Marketplaces">
                        <div className="justify-left" style={{textAlign:'left'}}>
                            <p>{otherBought} NFTs Purchased</p>
                            <p>{otherPrice}{otherPrice===0?'':'^18'} ETH Spent</p>
                            {/* <p>NAFF transactions</p>
                            <p>NAFF Spent</p>
                            <p>Other transactions</p>
                            <p>Others Spent</p> */}
                            {/* <p>Gas Used</p> */}
                        </div>
                    </ContactCard>
                    <ContactCard icon="launch" title="Total">
                        <div className="justify-left" style={{textAlign:'left'}}>
                            <p>{naftaPrice + otherPrice}{naftaPrice===0&&otherPrice===0?'':'^18'} ETH Spent</p>
                            <p>{transactionsNo} Transactions Made</p>
                            {/* <p>NAFF transactions</p>
                            <p>NAFF Spent</p>
                            <p>Other transactions</p>
                            <p>Others Spent</p> */}
                            <p>{gasUsed} Gas Used</p>
                        </div>
                    </ContactCard>
                </div>
                <div className="flex flex-wrap justify-center">
                    <Button>Claim</Button>
                </div>
            </div>
        </section>
    );
}
