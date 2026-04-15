// page.tsx (SSR page)
import { fetchAllCategory, fetchAllShelter } from "@/services/api"
// import ShelterClient from "./shelterClient"
import { CategoryDetailResponse, CustomApiError, ShelterAllResponse } from "@/types/interfaces"
import { Suspense } from "react"
import FilterCard from "@/components/livestock/filter-card"
import ShelterCardList from "@/components/shelter/shelter-card"
import Navbar from "@/components/navbar"


export default async function Shelter() {
  const category: CategoryDetailResponse | CustomApiError = await fetchAllCategory()
  const shelters: ShelterAllResponse | CustomApiError = await fetchAllShelter()
  const activeIconNav: string = 'shelter'; 
  return (
    <Suspense fallback={<div>Loading...</div>}> 
    <div className="bg-[#93540D] w-full flex flex-col items-center min-h-screen overflow-x-hidden"> 
      <Navbar activeIconNav={activeIconNav}/>
      <main className="flex items-center flex-col mt-[6rem] lg:mt-[12rem]" >
        <section className="flex flex-row px-[0.5rem] md:px-[2vw] xl:px-[3vw] 2xl:px-[10vw] justify-center w-full md:gap-[1rem] xl:gap-[2rem]">
          <section className="hidden lg:block bg-[#D2B48C] p-[2rem] shadow-lg/30 ring-[0.1rem] ring-black/5 min-w-[15rem] w-fit h-fit rounded-[0.5rem] text-[#2D2D2D]">
            <h4>Filter</h4>
            <hr></hr>
            <p className="font-bold">Category</p>
            { "data" in category ? (
                category.data.length > 0 ? (
                category.data.map((cat) => (
                    <FilterCard key={cat.id} category={cat} activeIconNav={activeIconNav} />
                ))
                ) : (
                <p className="text-gray-500">No categories available</p>
                )
            ) : (
                <p className="text-red-500">Failed to load categories {category.statusCode}</p>
            )}
            </section>
            { "data" in shelters ? (
                <ShelterCardList shelters={shelters.data} />
            ) : (
                <p className="text-red-500">Failed to load livestocks {shelters.error}</p>
            )}
          </section>
        </main>
    </div>
    </Suspense>  

    
  )
}
