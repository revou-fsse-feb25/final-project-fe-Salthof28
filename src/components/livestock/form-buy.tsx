'use client'
import { useCart } from "@/app/context/Cart-context";
import { fetchAllCareTransaction, fetchSheltersFarm } from "@/services/api";
import { CareTransaction, CustomApiError, FarmDetailResponse, Livestock, Shelter } from "@/types/interfaces";
import { Form, Input, Select, Button, DatePicker, Checkbox, InputNumber, message } from "antd";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

interface FormBuyAnimalProp {
  animal: Livestock;
  hiddenForm: () => void;
}
interface TreatmentValue {
  id: number;
  selected: boolean;
}

interface FormValues {
  totalLivestock: number;
  wantCare: "yes" | "no";
  shelterId: number;
  start: dayjs.Dayjs;
  finish: dayjs.Dayjs;
  address: string,
  treatments: TreatmentValue[];
}
export default function FormBuyAnimal({ animal, hiddenForm }: FormBuyAnimalProp) {
    const [hidden, setHidden] = useState<boolean>(true);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [form] = Form.useForm();
    const { Option } = Select;
    const { setTransaction, addBuyItem, addCareItem } = useCart();
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [careGiveIds, setCareGiveIds] = useState<number[]>([]);
    const [priceDaily, setPriceDaily] = useState<number>(0);
    const [livestock, setLivestock] = useState<number>(0);
    const [totalDays, setTotalDays] = useState<number>(0);
    const [careTransactions, setCareTransactions] = useState<CareTransaction[]>([]);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [maxSlots, setMaxSlots] = useState<number>(1);

    const wantCare = Form.useWatch("wantCare", form);
    const selectedShelterId = Form.useWatch("shelterId", form);
    const selectedShelter = shelters.find((s) => s.id === selectedShelterId);

    /** Fetch shelters for farm */
    const fetchSheltersAndBooking = async (id: number) => {
        const farmsJson: FarmDetailResponse | CustomApiError = await fetchSheltersFarm(id);
        if ("data" in farmsJson ) {
            setShelters(farmsJson.data.shelters);
        } else {
            console.error("Error fetching shelters:", farmsJson.message);
        }
    };
    useEffect(() => {
        async function fetchCare() {
            if(selectedShelterId) {
                const bookingJson = await fetchAllCareTransaction(selectedShelterId);
                if ('data' in bookingJson && selectedShelter && careTransactions.length < 1) {
                    // console.log('masuk ga')
                    setMaxSlots(selectedShelter.accomodate);
                    setCareTransactions(bookingJson.data);
                };
            }
        }
        fetchCare();
    }, [selectedShelterId])
    /** Toggle hidden when wantCare change */
    useEffect(() => {
        setHidden(wantCare !== "yes");
    }, [wantCare]);

    /** Fetch shelters one time */
    useEffect(() => {
        if (!hidden && shelters.length < 1) {
            fetchSheltersAndBooking(animal.farm_id);
        }
    }, [hidden]);

  /** Update form treatment when shelter selected */
    useEffect(() => {
        form.setFieldsValue({ totalLivestock: 1 })
        if (selectedShelter) {
            const initTreatments = selectedShelter.care_give.map((cg) => ({
                id: cg.id,
                selected: cg.required, // auto true for required
            }));
            form.setFieldsValue({ treatments: initTreatments });
        }
        calculateTotal()
    }, [selectedShelter, form]);

    const calculateTotal = () => {
        const values = form.getFieldsValue();
        // Base price = price animal per head
        const currentLivestock = values.totalLivestock;
        const basePrice = animal.price * (currentLivestock);
        // if user select care
        if (values.wantCare === "yes" && selectedShelter) {
            const currentCareGiveIds = values.treatments
                ?.filter((t: TreatmentValue) => t.selected)
                ?.map((t: TreatmentValue) => t.id) || [];

            const currentPriceDaily = selectedShelter.care_give
                .filter((cg) => currentCareGiveIds.includes(cg.id))
                .reduce((sum, cg) => {
                    let priceDaily = cg.price;
                    if(cg.unit === "WEEK"){
                        priceDaily = Math.ceil(cg.price / 7);
                    }
                    return sum + priceDaily;
                }, 0);
            const start = values.start;
            const finish = values.finish;
            const totalDays = start && finish ? (finish.diff(start, "day")) + 1 : 1;
            const carePrice = (currentPriceDaily + selectedShelter.price_daily) * (currentLivestock) * totalDays;
            setCareGiveIds(currentCareGiveIds);
            setPriceDaily(currentPriceDaily);
            setTotalDays(totalDays);
            setLivestock(currentLivestock);
            setTotalPrice(basePrice + carePrice);
        } else {
            // only buy
            setTotalPrice(basePrice);
        }
    };

const dateMap: Record<string, number> = {};
    careTransactions.forEach(ct => {
        const start = dayjs(ct.start_date);
        const finish = dayjs(ct.finish_date);
        let curr = start;
        while (curr.isSameOrBefore(finish, 'day')) {
            const key = curr.format('YYYY-MM-DD');
            dateMap[key] = (dateMap[key] || 0) + ct.total_livestock;
            curr = curr.add(1, 'day');
        }
    });

    const disabledDateStart = (current: dayjs.Dayjs) => {
        const today = dayjs().startOf('day');
        const dateStr = current.format('YYYY-MM-DD');
        const mapDate = dateMap[dateStr] || 0
        return current.isBefore(today, 'day') || mapDate >= maxSlots;
    };

    const disabledDateFinish = (current: dayjs.Dayjs) => {
        const start: dayjs.Dayjs = form.getFieldValue('start');
        if (!start) return true; // disable semua kalau start belum dipilih
        if (current.isBefore(start, 'day')) return true;

        let curr = start;
        while (curr.isSameOrBefore(current, 'day')) {
            const key = curr.format('YYYY-MM-DD');
            if ((dateMap[key] || 0) + (form.getFieldValue('totalLivestock') || 0) > maxSlots) return true;
            curr = curr.add(1, 'day');
        }
        return false;
    };

     const remainingSlots = selectedDate != null ? maxSlots - (dateMap[selectedDate.format("YYYY-MM-DD")] || 0) : maxSlots;

    const renderDateCell = (current: dayjs.Dayjs) => {
        const dateStr = current.format('YYYY-MM-DD');
        const used = dateMap[dateStr] || 0;
        const remaining = maxSlots - used;
        return (
            <div style={{ position: "relative" }}>
            <div>{current.date()}</div>
            {used > 0 && remaining > 0 && ( // showed remaining slots
                <div style={{ fontSize: 10, color: "green" }}>
                {remaining} slot
                </div>
            )}
            </div>
        );
    };

    const onFinish = (values: FormValues) => {
        // Set transaksi farm id
        setTransaction({ id_farm: animal.farm_id });
        // save buy transaction in localstorage
        addBuyItem({
            livestock_id: animal.id,
            name: animal.name,
            price: animal.price,
            total_livestock: values.totalLivestock,
            image: animal.img_livestock[0].url || '/cow-not-found.png',
            address: values.address
        });
        // if select care
        if (values.wantCare === "yes" && selectedShelter) {
            const start = values.start;
            const finish = values.finish;

            let overbooked = false;
            let curr = start;
            while (curr.isSameOrBefore(finish, 'day')) {
                const key = curr.format('YYYY-MM-DD');
                const booked = dateMap[key] || 0;
                if (booked + values.totalLivestock > maxSlots) {
                    overbooked = true;
                    break;
                }
                curr = curr.add(1, 'day');
            }
            if (overbooked) {
                message.error("Selected date exceeds available slots. Please adjust your selection.");
                return;
            }  

            addCareItem({
                livestock_id: animal.id,
                shelter_id: values.shelterId,
                name: selectedShelter.name,
                total_livestock: livestock,
                start_date: start.format("YYYY-MM-DD"),
                finish_date: finish.format("YYYY-MM-DD"),
                price_daily: priceDaily + selectedShelter.price_daily,
                careGive_id: careGiveIds,
                total_days: totalDays,
                image: selectedShelter.img_shelter[0].url || '/cow-not-found.png',
                address: values.address
            });
        }

        hiddenForm();
    };

    return (
        <div className="w-[95vw] 2xl:w-[75vw] bg-[#D2B48C] rounded-[1rem] p-[2rem]">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="w-full bg-[#D2B48C]"
                onValuesChange={calculateTotal}
            >
                <Button onClick={hiddenForm} type="text" icon={<ArrowLeft />} />
                <h4 className="text-center font-bold mb-4">Buy {animal?.name}</h4>

                <Form.Item
                label="Do you want care animal?"
                name="wantCare"
                rules={[{ required: true, message: "Please select an option" }]}
                >
                <Select placeholder="Select yes or no" className="[&_.ant-select-selector]:!bg-[#947449] [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-none w-full [&_.ant-select-selection-item]:!text-white">
                    <Option value="yes">Yes</Option>
                    <Option value="no">No</Option>
                </Select>
                </Form.Item>

                <Form.Item
                label="Total Livestock"
                name="totalLivestock"
                rules={[{ required: true, message: "Please input total livestock" }]}
                >
                <InputNumber defaultValue={1} min={1} max={animal.stock} className="!bg-[#947449] [&_.ant-input-number-input]:!text-white [&_.ant-input-number-handler-wrap]:!bg-amber-100"/>
                </Form.Item>

                {/* Form Care */}
                {!hidden && (
                <div className="flex flex-col my-[0.5rem] bg-amber-100 p-[1rem] rounded-[1rem]">
                    <Form.Item
                    label="Select Shelter"
                    name="shelterId"
                    rules={wantCare === "yes"
                        ? [{ required: true, message: "Please select shelter" }]
                        : []}
                    >
                        <Select placeholder="Select a shelter">
                            {shelters?.map((shelter) => (
                            <Option key={shelter.id} value={shelter.id}>
                                {shelter.name}
                            </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Checkbox untuk Treatments */}
                    {selectedShelter?.care_give?.map((treatment, index) => (
                    <div key={treatment.id}>
                        <Form.Item name={['treatments', index, 'id']} hidden>
                            <Input type="hidden" />
                        </Form.Item>
                        <Form.Item
                        name={['treatments', index, 'selected']}
                        valuePropName="checked"
                        >
                            <Checkbox disabled={treatment.required}>
                                {treatment.name} - Rp {treatment.price}
                            </Checkbox>
                        </Form.Item>
                    </div>
                    ))}
                    {selectedShelterId && (
                    <div className="flex flex-row gap-[1rem] md:gap-[4rem]">
                        <Form.Item
                            label="Start Care"
                            name="start"
                            rules={wantCare === "yes"
                            ? [{ required: true, message: "Please pick a start date" }]
                            : []}
                        >
                            <DatePicker disabledDate={disabledDateStart} onChange={(date) => setSelectedDate(date)} dateRender={renderDateCell} />
                        </Form.Item>
                        <Form.Item
                            label="Finish Care"
                            name="finish"
                            rules={wantCare === "yes"
                            ? [{ required: true, message: "Please pick a finish date" }]
                            : []}
                        >
                            <DatePicker disabledDate={disabledDateFinish} dateRender={renderDateCell} />
                        </Form.Item>
                    </div>
                    )}
                    <p>Sisa slot pada start date: {remainingSlots}</p>
                </div>
                )}
                <Form.Item
                label="Address Delivery"
                name="address"
                rules={[{ required: true, message: "Please input your address" }]}
                >
                <Input.TextArea placeholder="Enter your full address" rows={3} className="!bg-[#947449] !text-white" />
                </Form.Item>
                <Form.Item>
                    <h5>Rp {totalPrice}</h5>
                </Form.Item>
                <Form.Item>
                <Button type="primary" htmlType="submit">
                    Buy
                </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
