
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Wallet, Coins, ImageIcon, Settings } from 'lucide-react';
import { useState } from 'react';
import './App.css';

function App() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction, isPending } = useSignAndExecuteTransaction();
  
  // Estado para o formulário de NFT
  const [nftForm, setNftForm] = useState({
    packageId: '0x64821b2e26d21bdde9fe266387721ddb4509dcf201363b6d2dc4ec13b0d26ac1',
    participants: ''
  });

  const [execForm, setExecForm] = useState({
    sharedObjectId: '',
    imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/sui-3d-icon-png-download-8000692.png?f=webp'
  });

  const [showForm, setShowForm] = useState(true); // Iniciar aberto para mostrar que precisa configurar

  function handleMint() {
    // Validação do Package ID
    if (!nftForm.packageId || nftForm.packageId.trim() === '') {
      alert(' Please enter your Package ID first!\n\nYou need to deploy your smart contract and get the Package ID.');
      return;
    }

    if (!nftForm.packageId.startsWith('0x') || nftForm.packageId.length < 10) {
      alert(' Invalid Package ID format!\n\nPackage ID should start with "0x" and be a valid Sui address.');
      return;
    }

    // Validação e processamento dos participants
    if (!nftForm.participants || nftForm.participants.trim() === '') {
      alert(' Please enter participants addresses!\n\nYou need at least one participant address.');
      return;
    }

    // Converter string de participants para array e limpar
    const participantsArray = nftForm.participants
      .split(',')
      .map(addr => addr.trim())
      .filter(addr => addr !== '');

    // Validar se tem pelo menos um participant
    if (participantsArray.length === 0) {
      alert(' Please enter at least one valid participant address!');
      return;
    }

    // Validar formato dos endereços
    const invalidAddresses = participantsArray.filter(addr => 
      !addr.startsWith('0x') || addr.length < 10
    );

    if (invalidAddresses.length > 0) {
      alert(` Invalid address format!\n\nThese addresses are invalid: ${invalidAddresses.join(', ')}\n\nAddresses should start with "0x" and be valid Sui addresses.`);
      return;
    }

    const txb = new Transaction();

    txb.moveCall({
      target: `${nftForm.packageId}::draw::new_draw`,
      arguments: [
        txb.pure.vector('address', participantsArray)
      ],
    });

    txb.setGasBudget(10_000_000);

    signAndExecuteTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: (result) => { 
          console.log('Draw created! Digest:', result.digest);
          alert(`Draw created, copy the shared object id and Draw! View on explorer: https://suiscan.xyz/mainnet/tx/${result.digest}`);
        },
        onError: (error: Error) => {
          console.error('Error', error);
          alert(`Error: ${error.message}`);
        }
      },
    );
  }

  function handleExec() {
    // Validação do Package ID
    if (!execForm.sharedObjectId || execForm.sharedObjectId.trim() === '') {
      alert(' Please enter your Package ID first!\n\nYou need to deploy your smart contract and get the Package ID.');
      return;
    }

    if (!execForm.sharedObjectId.startsWith('0x') || execForm.sharedObjectId.length < 10) {
      alert(' Invalid Package ID format!\n\nPackage ID should start with "0x" and be a valid Sui address.');
      return;
    }

    const txb = new Transaction();

    txb.moveCall({
      target: `${nftForm.packageId}::draw::exec`,
      arguments: [
        txb.object(execForm.sharedObjectId),
        txb.object('0x8'),
        txb.pure.string(execForm.imageUrl)
      ],
    });

    txb.setGasBudget(10_000_000);

    signAndExecuteTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: (result) => { 
          console.log('Check for the winner!', execForm.sharedObjectId);
          alert(`Draw created, copy the shared object id and Draw! View on explorer: https://suiscan.xyz/mainnet/tx/${result.digest}`);
        },
        onError: (error: Error) => {
          console.error('Error', error);
          alert(`Error: ${error.message}`);
        }
      },
    );
  }

  function handleInputChange(field: string, value: string) {
    setNftForm(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function handleInput2Change(field: string, value: string) {
    setExecForm(prev => ({
      ...prev,
      [field]: value
    }));
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Coins className="logo-icon icon" />
          Sui Crypto Draw dApp
        </div>
        
        {!currentAccount ? (
          <div className="header-connect-wrapper">
            <Wallet className="wallet-icon" />
            <ConnectButton />
          </div>
        ) : (
          <div className="wallet-address-header">
            {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="content">
          {/* Welcome Section */}
          <h1 className="title">Create your own draw on Sui</h1>
          <p className="subtitle">
            Create a draw and gift the winner with an exclusive NFT made by you!
          </p>

          {/* Connection or Connected State */}
          {!currentAccount ? (
            <div className="connect-card">
              <div className="connect-header">
                <Wallet className="icon icon-blue" />
                <h2 className="connect-title">Connect Your Wallet</h2>
              </div>
              <p className="connect-description">
                Connect your Sui wallet to start
              </p>
              <ConnectButton />
            </div>
          ) : (
            <div>
              {/* Wallet Connected Card */}
              <div className="connected-card">
                <div className="connected-header">
                  <div className="status-dot"></div>
                  <h2 className="connected-title">Wallet Connected</h2>
                </div>
                <div className="wallet-address">
                  Address: {currentAccount.address}
                </div>
              </div>

              {/* Create Draw Card */}
              <div className="mint-card">
                <div className="mint-header">
                  <ImageIcon className="icon icon-blue" />
                  <h2 className="mint-title">Create a Draw</h2>
                  <button 
                    className="settings-button"
                    onClick={() => setShowForm(!showForm)}
                    title="Configure NFT parameters"
                  >
                    <Settings className="settings-icon" />
                  </button>
                </div>
                <p className="mint-description">
                  Create your draw on the Sui blockchain
                </p>
                
                {showForm ? (
                  <div className="nft-form">
                    <div className="form-group">
                      <label className="form-label">
                          Package ID: 
                        <span className="required">*</span>
                        <small className="form-hint">Deploy your smart contract first to get this ID</small>
                      </label>
                      <input
                        type="text"
                        className={`form-input ${!nftForm.packageId ? 'form-input-required' : ''}`}
                        value={nftForm.packageId}
                        onChange={(e) => handleInputChange('packageId', e.target.value)}
                        placeholder="0x1234567890abcdef... (required)"
                      />
                      {!nftForm.packageId && (
                        <small className="form-error"> Package ID is required</small>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Participants Array: comma separated
                        <span className="required">*</span>
                      </label>
                      <textarea
                        className="form-textarea"
                        value={nftForm.participants}
                        onChange={(e) => handleInputChange('participants', e.target.value)}
                        placeholder="address1, address2, ..., address 99"
                        rows={3}
                      />
                      {!nftForm.participants && (
                        <small className="form-error">Participants are required, otherwise who will you gift the NFT?</small>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mint-info">
                    <div className="mint-info-item">
                      <span className="mint-info-label">Participants:</span>
                      <span className={`mint-info-value ${!nftForm.participants ? 'missing-value' : ''}`}>
                        {nftForm.participants 
                          ? `${nftForm.participants.split(',').length} participants`
                          : '❌ Not configured (click ⚙️ to set)'
                        }
                      </span>
                    </div>
                    <div className="mint-info-item">
                      <span className="mint-info-label">Package ID:</span>
                      <span className={`mint-info-value ${!nftForm.packageId ? 'missing-value' : ''}`}>
                        {nftForm.packageId 
                          ? `${nftForm.packageId.slice(0, 10)}...${nftForm.packageId.slice(-8)}`
                          : '❌ Not configured (click ⚙️ to set)'
                        }
                      </span>
                    </div>
                    <div className="mint-info-item">
                      <span className="mint-info-label">Network:</span>
                      <span className="mint-info-value">Mainnet</span>
                    </div>
                  </div>
                )}

                <button 
                  className="mint-button"
                  onClick={handleMint} 
                  disabled={isPending || !nftForm.packageId || !nftForm.participants}
                >
                  {isPending 
                    ? 'Creating Draw...' 
                    : !nftForm.packageId 
                      ? 'Configure Package ID First' 
                      : !nftForm.participants 
                        ? 'Add Participants First'
                        : 'Create Draw'
                  }
                </button>
              </div>
              
              {/* Exec Draw Card */}
              <div className="mint-card">
                <div className="mint-header">
                  <ImageIcon className="icon icon-blue" />
                  <h2 className="mint-title">Draw</h2>
                </div>
                
                
                  <div className="exec-form">
                    <div className="form-group">
                      <label className="form-label">
                          Shared Object ID: 
                        <span className="required">*</span>
                        <small className="form-hint">First create a draw and get the Shared Object ID</small>
                      </label>
                      <input
                        type="text"
                        className={`form-input ${!execForm.sharedObjectId ? 'form-input-required' : ''}`}
                        value={execForm.sharedObjectId}
                        onChange={(e) => handleInput2Change('sharedObjectId', e.target.value)}
                        placeholder="0x1234567890abcdef... (required)"
                      />
                      {!execForm.sharedObjectId && (
                        <small className="form-error">Shared Object ID is required</small>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Image URL:</label>
                      <input
                        type="url"
                        className="form-input"
                        value={execForm.imageUrl}
                        onChange={(e) => handleInput2Change('imageUrl', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                

                <button 
                  className="mint-button"
                  onClick={handleExec} 
                  disabled={isPending || !nftForm.packageId || !execForm.sharedObjectId}
                >
                  {isPending 
                    ? 'Shuffling...' 
                    : !nftForm.packageId 
                      ? 'Configure Package ID First' 
                      : !execForm.sharedObjectId 
                        ? 'Add Shared Object ID'
                        : 'Shuffle Now!'
                  }
                </button>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;