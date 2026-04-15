import ClientDescriptionAnimal from "@/components/livestock/client-detail-livestock";
import Navbar from "@/components/navbar";
import { fetchDetailLivestock } from "@/services/api";
import { CustomApiError, LivestockDetailResponse } from "@/types/interfaces";

export const revalidate = 300;

interface AnimalDetailParam {
    params: Promise <{ id: string }>
}
export const dynamic = 'force-dynamic';
export default async function AnimalDetailPage ({ params }: AnimalDetailParam) {
    const resolvedParams = await params;
    const id: number = parseInt(resolvedParams.id);
    const livestock: LivestockDetailResponse | CustomApiError = await fetchDetailLivestock(id);
    const activeIconNav: string = 'animaldetail'; 
    return (
        <div className="w-full flex flex-col items-center min-h-screen overflow-x-hidden bg-[#93540D]">
            <Navbar activeIconNav={activeIconNav}/>
            { "data" in livestock ? (
                <ClientDescriptionAnimal livestock={livestock.data} />
            ) : (
                <section className="flex flex-col max-lg:items-center lg:flex-row gap-[2rem] xl:gap-[4rem] 2xl:gap-[6rem] w-[95vw] 2xl:w-[75vw] bg-amber-50 shadow-lg/30 ring-[0.1rem] ring-black/5 p-[2rem] rounded-[1rem]">
                    <h3 className="text-red-500">Failed to load livestocks {livestock.error}</h3>
                </section>
                
            )}
        </div>
    )
}