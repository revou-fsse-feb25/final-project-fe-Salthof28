'use client'
import { Livestock } from "@/types/interfaces";
import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import FormBuyAnimal from "./form-buy";
import SlideImageAnimal from "./slideImage-detail-livestock";

interface DescriptionAnimalProp {
    livestock: Livestock;
}
export default function ClientDescriptionAnimal ({ livestock }: DescriptionAnimalProp) {
    const [showForm, setShowForm] = useState<boolean>(false);

    const handleBtnBuy = (): void => {
        setShowForm(true);
    }
    return (
        <main className="flex flex-col lg:flex-row mt-[6rem] lg:mt-[12rem] gap-[clamp(1rem,1.3vw,2rem)] text-[#2D2D2D]">
            {/* specification section */}
            <section className="flex flex-col max-lg:items-center lg:flex-col gap-[clamp(2rem,3.8vw,6rem)] w-[80vw] lg:w-[35vw] bg-[#D2B48C] shadow-lg/30 ring-[0.1rem] ring-black/5 p-[clamp(0.8rem,1.3vw,2rem)] rounded-[1rem] items-center">
                {/* image */}
                <SlideImageAnimal images={livestock.img_livestock} />
                {/* description */}
                <table className="w-fit text-[clamp(0.5rem,1vw,0.8rem)] md:text-[clamp(0.8rem,1vw,1.5rem)]">
                    <tbody>
                        {/* w-[88%] 2xl: */}
                        <tr>
                            <td className="w-[75%] md:w-[80%] font-bold">Spesification</td>
                            <td className="font-bold">Detail</td>
                        </tr>
                        <tr>
                            <td className="w-[75%] md:w-[80%]">Age</td>
                            <td>{livestock?.age} Years</td>
                        </tr>
                        <tr>
                            <td className="w-[75%] md:w-[80%] ">Category</td>
                            <td>{livestock?.category?.name}</td>
                        </tr>
                        <tr>
                            <td className="w-[75%] md:w-[80%] ">Type</td>
                            <td>{livestock?.name}</td>
                        </tr>
                        <tr>
                            <td className="w-[75%] md:w-[80%] ">Gender</td>
                            <td>Male</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            {/* description section */}
            <section className="w-[80vw] lg:w-[35vw] bg-[#D2B48C] shadow-lg/30 ring-[0.1rem] ring-black/5 p-[clamp(1rem,1.3vw,2rem)] rounded-[1rem] items-center h-fit">
                <div>
                    <p className="text-[#5C3A19] font-bold !text-[clamp(0.6rem,0.7vw,1rem)]">Category: {livestock?.category?.name}</p>
                    <h3 className="font-bold text-[#5C3A19] -mt-[clamp(0.6rem,0.5vw,0.8rem)] !text-[clamp(1.5rem,1.9vw,3rem)]">{livestock?.name}</h3>
                    <h5 className="font-bold text-white mb-[clamp(0rem,0.7vw,1rem)] py-1 px-[1rem] bg-black w-fit items-center rounded-[2rem] !text-[clamp(0.6rem,0.7vw,1.1rem)]">Rp {new Intl.NumberFormat('id-ID').format(livestock?.price)}</h5>
                    <h5 className="text-justify mb-[clamp(0.4rem,1.3vw,2rem)] !text-[clamp(0.6rem,0.7vw,1.1rem)]">{livestock?.description}</h5>
                    <h5 className="!text-[clamp(0.6rem,0.7vw,1.1rem)]">Farm: {livestock?.farm.name}</h5>
                    <h5 className="mb-[clamp(0rem,1.3vw,2rem)] !text-[clamp(0.6rem,0.7vw,1.1rem)]">{livestock?.farm.location}</h5>
                    <div className="flex flex-row mt-[1rem] justify-center">
                        <button onClick={handleBtnBuy} className="font-bold w-[clamp(4rem,5vw,8rem)] bg-[#3E5622] hover:bg-[#E3B704] hover:text-black text-[clamp(0.8rem,1vw,1.5rem)] transition-opacity delay-200 active:scale-90 text-white shadow-lg/20 ring-[0.1rem] ring-black/5 rounded-[clamp(0.3rem,0.4vw,0.6rem)]">Buy</button>
                        {/* <button className="bg-emerald-500 hover:bg-emerald-700 hover:text-white xl:1rem rounded-[0.5rem] transition-opacity delay-200 active:scale-90"><MessageSquareText className="w-[4rem]" /></button> */}
                    </div>
                </div>
            </section>
            {/* section form */}
            {showForm === true && (
            <>
                {/* Overlay blur */}
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowForm(false)} />
                {/* Form */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <FormBuyAnimal animal={livestock} hiddenForm={() => setShowForm(false)} />
                </div>
            </>
            )}
        </main>
    )
}