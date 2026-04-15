'use client'
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Cart, useCart } from "../context/Cart-context";
import BuyList from "@/components/cart/buy-list";
import CareList from "@/components/cart/care-list";
import { useSession } from "next-auth/react";
import { fetchTransactionBuy, fetchTransactionBuyCare, fetchTransactionCare } from "@/services/api";
import { message } from "antd";
import {  CleanCartBuyCare } from "@/types/interfaces";

export default function Carts() {
    const activeIconNav: string = 'cart';
    const { data: session, status } = useSession();
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

    const {cart, getTotal, addBuyItem, addCareItem, decreaseBuyItem, decreaseCareItem, removeBuyItem, removeCareItem, checkout } = useCart();

    const handleCheckOut = async () => {
        if (status === "unauthenticated") {
            router.push("/login");
        } 
        else {
            const cleanCart = await filterPayload(cart)
            await fetchCreateTransaction(cleanCart);
        }
    };

    const filterPayload = (cart: Cart) => {
        const payload: CleanCartBuyCare = {
            transaction: { id_farm: Number(cart.transaction.id_farm) },
        };
        if (cart.buy.length > 0) {
            payload.buy = cart.buy.map(b => ({
            livestock_id: Number(b.livestock_id),
            total_livestock: Number(b.total_livestock),
            address: b.address
            }));
        }
        if (cart.care.length > 0) {
            payload.care = cart.care.map(c => ({
            livestock_id: c.livestock_id,
            shelter_id: Number(c.shelter_id),
            total_livestock: Number(c.total_livestock),
            address: c.address,
            start_date: c.start_date,
            finish_date:  c.finish_date,
            careGive_id: c.careGive_id
            }));
        }
        return payload;
    };

    const fetchCreateTransaction = async (cartClean: CleanCartBuyCare) => {
        try {
            const token = session?.accessToken;
            if (!token) return;
            console.log(cart)
            let result: { message?: string } | undefined = undefined;
            if (cart.buy.length > 0 && cart.care.length > 0) {
                console.log(session?.accessToken);
                result = await fetchTransactionBuyCare(cartClean, token);
                messageApi.open({
                    type: "success",
                    content: 'Transaction Success',
                });
            } 
            if (cart.buy.length > 0 && cart.care.length < 1) {
                console.log(session?.accessToken);
                result = await fetchTransactionBuy(cartClean, token);
                messageApi.open({
                    type: "success",
                    content: 'Transaction Success',
                });
            } 
            if (cart.care.length > 0 && cart.buy.length < 1) {
                result = await fetchTransactionCare(cartClean, token);
                messageApi.open({
                    type: "success",
                    content: 'Transaction Success',
                });
            }
            if (result?.message) {
                messageApi.open({
                    type: "error",
                    content: result.message,
                });
            } 
            checkout();
        } catch (err) {
            messageApi.open({
                type: "error",
                content: "Something went wrong while processing checkout.",
            });
            messageApi.open({
                type: "error",
                content: `${err}`,
            });
        }
    }

    return (
        <div className="w-full bg-[#93540D] flex flex-col items-center min-h-screen overflow-x-hidden">
            <Suspense fallback={<div>Loading...</div>}>
                <Navbar activeIconNav={activeIconNav} />
            </Suspense>
            {contextHolder}
            <h2 className="pt-[8rem] text-2xl font-bold">Checkout</h2>
            <main className="flex flex-col items-center gap-6 text-black w-full px-6 py-4">
                {/* empty cart */}
                {(cart.buy.length < 1 && cart.care.length < 1) && (
                    <div className="flex flex-col items-center gap-4 w-[95vw] md:w-[75vw] bg-[#D2B48C] shadow-lg ring-[0.1rem] ring-black/5 p-8 rounded-xl justify-center">
                        <h4 className="text-lg font-semibold text-center">
                            {`Your cart is empty. Let's fill it up with something awesome!`}
                        </h4>
                    </div>
                )}
                {/* List Buy Items */}
                {cart.buy.length > 0 && (
                    <div className="w-[95vw] md:w-[75vw] bg-amber-50 shadow-md rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">Buy Items</h3>
                        {cart.buy.map((item, index) => (
                            <BuyList key={index} item={item} decreaseBuyItem={decreaseBuyItem} addBuyItem={addBuyItem} removeBuyItem={removeBuyItem} />
                        ))}
                    </div>
                )}
                {/* List Care Items */}
                {cart.care.length > 0 && (
                    <div className="w-[95vw] md:w-[75vw] bg-amber-50 shadow-md rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">Care Items</h3>
                        {cart.care.map((item, index) => (
                            <CareList key={index} item={item} decreaseCareItem={decreaseCareItem} addCareItem={addCareItem} removeCareItem={removeCareItem} />
                        ))}
                    </div>
                )}

                {/* Total price + button Checkout */}
                {(cart.buy.length > 0 || cart.care.length > 0) && (
                    <div className="flex flex-col items-center gap-4 mt-6 w-[95vw] md:w-[75vw] bg-amber-50 shadow-md rounded-xl p-6">
                        <div className="flex justify-between w-full text-lg font-semibold">
                            <span>Total:</span>
                            <span>Rp {getTotal().toLocaleString()}</span>
                        </div>
                        <button
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                            onClick={handleCheckOut}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
