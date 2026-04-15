'use client'
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

interface SlideImagesHomeProp {
    imageCategory: string[]
}
export default function SlideImagesHome({ imageCategory }: SlideImagesHomeProp) {
    const [currentImage, setCurrentImage] = useState<number>(0);
    const router: AppRouterInstance = useRouter();

    useEffect(() => {
        const intervalImageHome = setInterval (() => {
            setCurrentImage((prev) => (prev + 1) % imageCategory.length);
        }, 2000);
        return () => {
            clearInterval(intervalImageHome)
        }
    }, [])
    return (
        <section className="flex flex-col w-screen h-screen bg-cover bg-center justify-center items-start px-[2rem] sm:px-[0rem] md:px-[6rem] xl:px-[15rem] 2xl:px-[35rem]" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.8) 80%, rgb(0, 0, 0)), url(${imageCategory[currentImage]})`}}>
        <p className="text-[#F2FEDC] leading-none font-medium">You need</p>
        <h1 className="leading-none text-[#f2944b] font-bold">Livestock <span className="text-[0.8rem] md:text-[1.5rem] lg:text-[3rem] text-[#00c9ac] font-medium">or care service?</span></h1>
            <div className="flex gap-[2rem]">
                <button onClick={() => router.push('/livestock')} className="btn text-[#F2FEDC] shadow-lg font-bold bg-[#A09218] hover:bg-[#918300] hover:text-white duration-200 transition-opacity delay-200 active:scale-90">Livestock</button>
                <button onClick={() => router.push('/shelter')} className="btn text-[#F2FEDC] shadow-lg font-bold bg-[#976F52] hover:bg-[#a24d0f] hover:text-white duration-200 transition-opacity delay-200 active:scale-90">Shelter</button>
            </div>
        </section>
    )
}