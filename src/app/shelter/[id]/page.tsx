
import Navbar from "@/components/navbar";
import ClientDescriptionShelter from "@/components/shelter/client-detail-shelter";
import { fetchDetailShelter } from "@/services/api";
import { CustomApiError, ShelterDetailResponse } from "@/types/interfaces";
export const revalidate = 300;

interface AnimalDetailParam {
    params: Promise <{ id: string }>
}
export const dynamic = 'force-dynamic';
export default async function ShelterDetailPage ({ params }: AnimalDetailParam) {
    const resolvedParams = await params;
    const id: number = parseInt(resolvedParams.id);
    const shelter: ShelterDetailResponse | CustomApiError = await fetchDetailShelter(id);
    const activeIconNav: string = 'shelterdetail'; 
    return (
        <div className="w-full flex flex-col items-center min-h-screen overflow-x-hidden bg-[#93540D]">
            <Navbar activeIconNav={activeIconNav}/>
            { "data" in shelter ? (
                <ClientDescriptionShelter shelter={shelter.data} />
            ) : (
                <section className="flex flex-col max-lg:items-center lg:flex-row gap-[2rem] xl:gap-[4rem] 2xl:gap-[6rem] w-[95vw] 2xl:w-[75vw] bg-amber-50 shadow-lg/30 ring-[0.1rem] ring-black/5 p-[2rem] rounded-[1rem]">
                    <h3 className="text-red-500">Failed to load shelter {shelter.error}</h3>
                </section>
                
            )}
        </div>
    )
}