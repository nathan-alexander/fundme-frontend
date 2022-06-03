import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = balance
withdrawButton.onclick = withdraw

//window.ethereum.request({method: "eth_requestAccounts "}) will grab the current metamask accounts and request a connection
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        window.ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("connectButton").innerHTML = "Connected"
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please install Metamask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("fundAmount").value
    console.log(`Funding with ${ethAmount} eth...`)
    if (typeof window.ethereum !== "undefined") {
        //provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //get the connected account
        const signer = provider.getSigner()
        //get the contract that you want to interact with
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            //put the transaction in a try -> we are calling the contract's fund function
            //.fund({value: ...}) is how you input how much currency you want to add to the transaction
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //we want to listen for the transaction to be done
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Withdrawn")
        } catch (error) {
            console.log(error)
        }
    }
}

async function balance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //grab the balance from the provider, pass in the contract address to get the balance of that address
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    //this is a listener that will listen for a transaction response
    console.log(`Mining ${transactionResponse.hash}...`)
    //return a promise so code will stop until the promise is resolved, not giving a reject condition
    //will put in a reject condition on real code
    return new Promise((resolve, reject) => {
        //using ethers once function -> returns a listener once we have a hash for the transactionresponse
        //transactionReceipt is given as the callback to the function so we can add data about it
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            //when the 'once' is completed we resolve the promise so code can continue
            resolve()
        })
    })
}
