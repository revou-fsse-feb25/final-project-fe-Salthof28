'use client'
import { useCart } from "@/app/context/Cart-context";
import { AlignJustify, CircleUserRound, Home, Rabbit, ShoppingCart, Warehouse, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

interface NavbarProp {
    activeIconNav: string;
}
export default function Navbar({ activeIconNav }: NavbarProp) {
    const { data: session } = useSession();
    const router: AppRouterInstance = useRouter();
    const { cart } = useCart();
    const findParams: ReadonlyURLSearchParams = useSearchParams();
    const categoryParams = findParams.getAll('category') || 'All';
    const [show, setShow] = useState<boolean>(true);
    const lastPosition = useRef<number>(0);
    const [menu, setMenu] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const handleScroll = (): void => {
        const currentPosition = window.scrollY;
        setShow(currentPosition > lastPosition.current && currentPosition > 50 ? false : true);
        lastPosition.current = currentPosition;
    };
    const getInputSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearch(e.target.value);

    }

    const handleInptSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const currentCatParam: string[] = categoryParams;
        console.log(`cat: ${currentCatParam}`);
        if(activeIconNav === 'animal') {
            console.log(`search Animal: ${search}`);
        }
        else {
            console.log(`search Shelter: ${search}`);
        }
        
        updateParams(currentCatParam);
    }
    const updateParams = useCallback((catParams: string[]) => {
            const params = new URLSearchParams(findParams.toString());
            // delete old params
            params.delete('category');
            params.delete('search');
            // add new params
            catParams.forEach((cat) => params.append('category', cat));
            if(search !== "" && !/[=&]/.test(search)) {
                params.append('search', search)
            }
            if(activeIconNav === 'animal') {
                router.push(`/livestock?${params.toString()}`);
            }
            else {
                router.push(`/shelter?${params.toString()}`);
            }
            
    }, [search])
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [])
    return(
        <div className="flex justify-center">
            <header className={`w-[98vw] flex flex-col lg:h-fit max-lg:bg-[#3C2700] text-white mt-[1rem] p-[0.5rem] items-center rounded-[1rem] duration-500 fixed overflow-hidden ${show ? "translate-y-0" : "-translate-y-full"} transition-all duration-300 ease-in-out ${menu ? 'h-fit' : 'h-[2.5rem]'} z-50`}>
                <div className="w-full flex flex-col lg:flex-row justify-center lg:h-fit lg:gap-[2rem] gap-[1rem] items-center relative">
                    <div className="w-full flex flex-row items-center justify-center lg:w-auto">
                        <img src='/smafarm-logo.png' className="w-[2rem] lg:w-[6rem] absolute left-0 top-0 lg:top-[1.3em]" />
                        {(activeIconNav === 'animal' || activeIconNav === 'shelter') && (
                        <form className="lg:hidden flex flex-row" onSubmit={handleInptSearch}>
                            <input data-testid='inptSearch' onChange={getInputSearch} className="text-center bg-white/40 rounded-md hover:bg-emerald-500 p-[0.1rem] text-[0.8rem] text-white" placeholder="Search" ></input>
                            <button type="submit" data-testid="btnSearch" className="font-bold ml-2 bg-[#93540D] p-1 rounded-md hover:bg-emerald-700 hover:text-amber-50 transition-opacity active:scale-90 duration-200 text-[0.6rem]">Search</button>   
                        </form>
                        )}
                        <button onClick={() => setMenu(!menu)} className="lg:hidden w-auto absolute right-0 top-0">{menu ? <X /> : <AlignJustify />}</button>
                    </div>
                    <nav className={` flex-col flex items-center bg-[#3C2700] py-[1rem] px-[1rem] rounded-[1rem]`}>
                        <div className={`flex-row lg:flex-row flex lg:gap-[1rem] gap-[clamp(0.5rem,2.1vw,1rem)]`}>
                            <Link href='/' className={`flex flex-col items-center text-[0.6rem] lg:text-[0.8rem] ${activeIconNav === 'home' ? 'text-black bg-[#E3B704] rounded-[1rem]' : 'text-[#F2FEDC]'} px-4 py-1`}><Home className="w-[2rem] h-[2rem] lg:w-[2.5rem] lg:h-[2.5rem]"/>Home</Link>
                            <Link href='/livestock' className={`flex flex-col items-center text-[0.6rem] lg:text-[0.8rem] ${(activeIconNav === 'animal' || activeIconNav === 'animaldetail') ? 'text-black bg-[#E3B704] rounded-[1rem]' : 'text-[#F2FEDC]'} px-1.5 py-1`}><Rabbit className="w-[2rem] h-[2rem] lg:w-[2.5rem] lg:h-[2.5rem]"/>Livestocks</Link>
                            <Link href='/login' className={`flex flex-col items-center text-[0.6rem] lg:text-[0.8rem] ${activeIconNav === 'login' ? 'text-black bg-[#E3B704] rounded-[1rem]' : 'text-[#F2FEDC]'} px-4 py-1`}>
                            {session ? (
                                <img
                                    src={session.user.profile?.img_profile || '/cow-not-found.png'}
                                    alt="User Avatar"
                                    className="w-[2rem] h-[2rem] lg:w-[2.5rem] lg:h-[2.5rem] rounded-full border-4"
                                />
                            ) : (
                                <CircleUserRound className="w-[2rem] h-[2rem] lg:w-[2.5rem] lg:h-[2.5rem]"/>  
                            )}

                            {session ? session.user.name.split(" ")[0] : 'Guest'}
                            </Link>
                            <Link href='/shelter' className={`flex flex-col items-center text-[0.6rem] lg:text-[0.8rem] ${(activeIconNav === 'shelter' || activeIconNav === 'shelterdetail') ? 'text-black bg-[#E3B704] rounded-[1rem]' : 'text-[#F2FEDC]'} px-4 py-1`}><Warehouse className="w-[2rem] h-[2rem] lg:w-[2.5rem] lg:h-[2.5rem]"/> Shelter</Link>
                            <Link href='/cart' className={`relative flex flex-col items-center text-[0.6rem] lg:text-[0.8rem] ${activeIconNav === 'cart' ? 'text-black bg-[#E3B704] rounded-[1rem]' : 'text-[#F2FEDC]'} px-4 py-1`}>{(cart.buy.length > 0 || cart.care.length > 0) && (
                                <span className={`flex items-center justify-center absolute text-[0.8rem] -top-[0.5rem] lg:left-[0.8rem] bg-red-700 rounded-[100%] w-[1.2rem] h-[1.2rem] animate-bounce p-[0.7rem]`}>N</span>
                            )}<ShoppingCart className="w-[2rem] h-[2rem] lg:w-[2.5rem] lg:h-[2.5rem]"/>Cart</Link>
                        </div>
                        {(activeIconNav === 'animal' || activeIconNav === 'shelter') && (
                            <form className="max-lg:hidden " onSubmit={handleInptSearch}>
                                <input data-testid='inptSearch' onChange={getInputSearch} className="mt-[1rem] text-center bg-white/40 rounded-md hover:bg-[#63773e] p-0.5 text-[0.8rem] 2xl:text-[1rem] text-[#3F3916] hover:text-[#f5d521]" placeholder="Search" ></input>
                                <button type="submit" data-testid="btnSearch" className="font-bold ml-2 bg-[#93540D] hover:bg-[#918300] p-1 rounded-md hover:text-amber-50 transition-opacity active:scale-90 duration-200 text-[0.8rem]">Search</button>   
                            </form>
                        )}
                    </nav>
                    <button className="font-bold ml-2 bg-[#A09218] hover:bg-[#918300] p-2 text-[0.8rem] 2xl:text-[1rem] rounded-lg shadow-lg/20 ring-[0.1rem] ring-black/5 absolute right-0 top-[1.8em] hidden">about Smafarm</button>   
                </div>
            </header>
            
        </div>
    )
}