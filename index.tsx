"use client";

import History from "@/components/History";
import NftCard from "@/components/cards/NftCard";
import getConfig from "@/config";
import {
  MARKETPLACE_SELECTED,
  MARKETPLACE_SELECTED_CURRENCY,
} from "@/config/constants";
import useScroll from "@/hooks/useScroll";
import { getLocalStorage } from "@/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { initFlowbite } from "flowbite";
import { FaCopy, FaRegCopy } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const config = getConfig();
const Profile = () => {
  const [nftsItem, setData] = useState<any>([]);
  const [nftSell, setNftSell] = useState<any>([]);
  const [history, setHistory] = useState<any>({});
  const [currency, setCurrency] = useState<any>();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [search, setSearch] = useState<any>();

  //pagination
  const [isRender, setIsRender] = useState(false);
  const [isLastItems, setIsLastItems] = useState(false);
  const [isLastHistory, setIsLastHistory] = useState(false);
  // const [nextCursor, setNextCursor] = useState<any>();
  const [page, setPage] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const { data: session, status } = useSession();
  const wallet = useWallet();
  const scroll = useScroll();

  useEffect(() => {
    initFlowbite();
    init();
  }, [wallet.connected, status, search]);

  useEffect(() => {
    if (scroll.isBottom && !isRender && (!isLastItems || !isLastHistory)) {
      addNfts();
    }
  }, [scroll.isBottom]);

  const init = async () => {
    setIsFirstRender(true);
    setPage(0);
    setIsLastItems(false);
    setIsLastHistory(false);

    // if (wallet.connected && status === "unauthenticated") {
    //   setIsFirstRender(false);
    //   return;
    // }

    let market_currency_selected = getLocalStorage(
      MARKETPLACE_SELECTED_CURRENCY
    );
    setCurrency(market_currency_selected);

    let address = wallet.publicKey?.toBase58();
    let market_address_selected = getLocalStorage(MARKETPLACE_SELECTED);
    if (address) {
      let res = await axios.get(
        `/api/profile/my-nfts?wallet_address=${wallet.publicKey?.toBase58()}&market_address=${market_address_selected}&page=${page}&size=${
          config.limit
        }${ search ? `&search=${search}` : ``}`
      );
      setData(res.data.data);
      if (res.data.data.length < config.limit) {
        setIsLastItems(true);
      }
      // setNextCursor(res.data.data.next_cursor);

      let resSell = await axios.get(
        `/api/profile/nfts-sell?wallet_address=${wallet.publicKey?.toBase58()}&market_address=${market_address_selected}`
      );
      setNftSell(resSell.data.data);
      setPage(page + 1);

      let resHistory = await axios.get(
        `/api/transaction/history?network=${
          config.network
        }&market_address=${market_address_selected}&wallet_address=${wallet.publicKey?.toBase58()}`
      );
      setHistory(resHistory.data);
    }
    setIsFirstRender(false);
  };

  const addNfts = async () => {
    setIsRender(true);
    // if (wallet.connected && status === "unauthenticated") {
    //   setIsFirstRender(false);
    //   return;
    // }

    setPage(page + 1);
    let market_address_selected = getLocalStorage(MARKETPLACE_SELECTED);

    if (!isLastItems) {
      let res = await axios.get(
        `/api/profile/my-nfts?wallet_address=${wallet.publicKey?.toBase58()}&page=${page}&size=${
          config.limit
        }${ search ? `&search=${search}` : ``}`
        // `/api/profile/my-nfts?wallet_address=${wallet.publicKey?.toBase58()}&cursor=${nextCursor}`
      );
      nftsItem.push(...res.data.data);
      // setNextCursor(res.data.data.next_cursor);
      if (res.data.data.length < config.limit) {
        setIsLastItems(true);
      }
    }

    if (!isLastHistory) {
      let resHistory = await axios.get(
        `/api/transaction/history?network=${
          config.network
        }&market_address=${market_address_selected}&wallet_address=${wallet.publicKey?.toBase58()}&page=${page}`
      );
      history.data?.push(...resHistory.data.data);
      if (resHistory.data.data.length < config.limit) {
        setIsLastHistory(true);
      }
    }

    scroll.setIsBottom(false);
    setIsRender(false);
  };

  const walletAddress = wallet?.publicKey?.toBase58();
  const shortenedAddress = walletAddress
    ? `${walletAddress.substring(0, 5)}...${walletAddress.slice(-5)}`
    : null;

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);

      // Setelah beberapa detik, atur kembali status salinan ke false
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };
  return (
    <>
      {wallet.connected ? (
        <>
          <div className="flex flex-col items-center mt-4">
            {session?.user && (
              <span
                style={{ backgroundImage: `url('${session.user.image}')` }}
                className="w-[150px] h-[150px]  rounded-full bg-cover bg-no-repeat transition-all duration-300 hover:opacity-75 border-4 shadow-lg"
              />
            )}
            <div className="mt-2">
              <span className="font-medium text-gray-900">
                {shortenedAddress}{" "}
                {walletAddress && (
                  <button
                    onClick={handleCopyAddress}
                    disabled={isCopied}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                  >
                    {isCopied ? <FaRegCopy /> : <FaCopy />}
                  </button>
                )}
              </span>
            </div>
          </div>

          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul
              className="flex flex-wrap -mb-px text-sm font-medium text-center"
              id="default-tab"
              data-tabs-toggle="#default-tab-content"
              role="tablist"
            >
              <li className="mr-2" role="presentation">
                <button
                  className="inline-block p-4 border-b-2 rounded-t-lg"
                  id="items-tab"
                  data-tabs-target="#items"
                  type="button"
                  role="tab"
                  aria-controls="profile"
                  aria-selected="false"
                >
                  Items
                </button>
              </li>
              <li className="mr-2" role="presentation">
                <button
                  className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  id="sell-tab"
                  data-tabs-target="#sell"
                  type="button"
                  role="tab"
                  aria-controls="dashboard"
                  aria-selected="false"
                >
                  Sell
                </button>
              </li>
              <li className="mr-2" role="presentation">
                <button
                  className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  id="activity-tab"
                  data-tabs-target="#activity"
                  type="button"
                  role="tab"
                  aria-controls="settings"
                  aria-selected="false"
                >
                  Activity
                </button>
              </li>
            </ul>
          </div>
          <div id="default-tab-content">
            <div
              className="hidden p-4 rounded-lg"
              id="items"
              role="tabpanel"
              aria-labelledby="items-tab"
            >
            <div className="mx-2 mb-4">
              <input type="text" id="serach-name" onChange={(e) => {setSearch(e.target.value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search..." />
            </div>
              {nftsItem?.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {nftsItem?.map((item: any, idx: number) => {
                      return <NftCard key={idx} data={item} />;
                    })}
                  </div>
                </>
              ) : (
                <div>
                  {isFirstRender ? (
                    <></>
                  ) : (
                    <>
                      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        No items
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div
              className="hidden p-4 rounded-lg"
              id="sell"
              role="tabpanel"
              aria-labelledby="sell-tab"
            >
              {nftSell?.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {nftSell?.map((item: any, idx: number) => {
                      return <NftCard key={idx} data={item} />;
                    })}
                  </div>
                </>
              ) : (
                <div>
                  {isFirstRender ? (
                    <></>
                  ) : (
                    <>
                      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        No items for sale
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div
              className="hidden p-4 rounded-lg"
              id="activity"
              role="tabpanel"
              aria-labelledby="activity-tab"
            >
              {history?.data?.length > 0 ? (
                <>
                  <History
                    data={history?.data}
                    network={config.network}
                    currency={currency}
                  />
                </>
              ) : (
                <div>
                  {isFirstRender ? (
                    <></>
                  ) : (
                    <>
                      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        No Activity
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {isRender || isFirstRender ? (
            <>
              <div
                role="status"
                className="mt-8 flex justify-center items-center"
              >
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only"></span>
              </div>
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <>
          <div className="min-h-screen flex items-center text-center justify-center">
            <div className=" bg-white rounded-lg p-8 shadow-lg">
              <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-gray-600 mb-8">
                Please connect your wallet to access all the features.
              </p>
              {/* <WalletMultiButtonDynamic className="wallet-button" /> */}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
