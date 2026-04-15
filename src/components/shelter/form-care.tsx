'use client'

import { useCart } from "@/app/context/Cart-context";
import { CareTransaction, Shelter } from "@/types/interfaces";
import { Form, Input, Button, DatePicker, Checkbox, InputNumber, message } from "antd";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { fetchAllCareTransaction } from "@/services/api";
dayjs.extend(isSameOrBefore);

interface FormValues {
  totalLivestock: number;
  shelterId: number;
  start: dayjs.Dayjs;
  finish: dayjs.Dayjs;
  address: string,
  treatments: TreatmentValue[];
}
interface TreatmentValue {
  id: number;
  selected: boolean;
}
interface FormCareAnimalProp {
    shelter: Shelter;
    hiddenForm: () => void;
}
export default function FormRentShelter ({ shelter, hiddenForm }: FormCareAnimalProp) {
    // const [shelters, setShelters] = useState<Shelter[]>([]);
    const [form] = Form.useForm();
    const { setTransaction, addCareItem } = useCart();
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [careGiveIds, setCareGiveIds] = useState<number[]>([]);
    const [priceDaily, setPriceDaily] = useState<number>(0);
    const [livestock, setLivestock] = useState<number>(0);
    const [totalDays, setTotalDays] = useState<number>(0);
    const [careTransactions, setCareTransactions] = useState<CareTransaction[]>([]);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    
    const maxSlots = shelter.accomodate;

    useEffect(() => {
        async function fetchCare() {
            const bookingJson = await fetchAllCareTransaction(shelter.id);
            if ('data' in bookingJson) {
                setCareTransactions(bookingJson.data)
            };
        }
        fetchCare();
    }, [shelter]);

    const calculateTotal = () => {
        const values = form.getFieldsValue();
        const currentCareGiveIds = values.treatments
            ?.filter((t: TreatmentValue) => t.selected)
            ?.map((t: TreatmentValue) => t.id) || [];
        const currentPriceDaily = shelter.care_give
            .filter((cg) => currentCareGiveIds.includes(cg.id))
            .reduce((sum, cg) => {
                let priceDaily = cg.price;
                if(cg.unit === "WEEK"){
                    priceDaily = Math.ceil(cg.price / 7);
                }
                return sum + priceDaily;
            }, 0);
        const currentStart = values.start;
        const currentFinish = values.finish;
        const currentLivestock = values.totalLivestock;
        const basePrice = shelter.price_daily;
        const totalDay = currentStart && currentFinish
            ? (currentFinish.diff(currentStart, "day")) + 1
            : 1;
        const total = (currentPriceDaily + basePrice) * currentLivestock * totalDay;
        setCareGiveIds(currentCareGiveIds);
        setPriceDaily(currentPriceDaily);
        setTotalDays(totalDay);
        setLivestock(currentLivestock);
        setTotalPrice(total);
    };
  /** Update form treatment when shelter selected */
    useEffect(() => {
        form.setFieldsValue({ totalLivestock: 1 })
        const initTreatments = shelter.care_give.map((cg) => ({
            id: cg.id,
            selected: cg.required, // auto true for required
        }));
        form.setFieldsValue({ treatments: initTreatments });
        setTimeout(() => { calculateTotal(); }, 0);
    }, [form]);

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
        setTransaction({ id_farm: shelter.farm_id });
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
            shelter_id: shelter.id,
            name: shelter.name,
            total_livestock: livestock,
            start_date: start.format("YYYY-MM-DD"),
            finish_date: finish.format("YYYY-MM-DD"),
            price_daily: priceDaily + shelter.price_daily,
            careGive_id: careGiveIds,
            total_days: totalDays,
            image: shelter.img_shelter[0].url || '/cow-not-found.png',
            address: values.address
        });

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
                <h4 className="text-center font-bold mb-4">Rent {shelter?.name} {shelter?.farm?.name}</h4>

                <Form.Item
                label="Total Livestock"
                name="totalLivestock"
                rules={[{ required: true, message: "Please input total livestock" }]}
                >
                <InputNumber defaultValue={1} min={1} className="!bg-[#947449] [&_.ant-input-number-input]:!text-white [&_.ant-input-number-handler-wrap]:!bg-amber-100" />
                </Form.Item>
                    {/* Checkbox untuk Treatments */}
                    {shelter?.care_give?.map((treatment, index) => (
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
                    <div className="flex flex-row gap-[1rem] md:gap-[4rem]">
                        <Form.Item
                            label="Start Care"
                            name="start"
                            rules={[{ required: true, message: "Please pick a start date" }]}
                        >
                            <DatePicker disabledDate={disabledDateStart} onChange={(date) => setSelectedDate(date)} dateRender={renderDateCell} />
                        </Form.Item>
                        <Form.Item
                            label="Finish Care"
                            name="finish"
                            rules={[{ required: true, message: "Please pick a finish date" }]}
                        >
                            <DatePicker disabledDate={disabledDateFinish} dateRender={renderDateCell} />
                        </Form.Item>
                    </div>
                    <p>Sisa slot pada start date: {remainingSlots}</p>
                <Form.Item
                label="Address Delivery"
                name="address"
                rules={[{ required: true, message: "Please input your address" }]}
                >
                    <Input placeholder="Enter your full address"  />
                </Form.Item>
                <Form.Item>
                    <h5>Rp {totalPrice}</h5>
                </Form.Item>
                <Form.Item>
                    <Button color="cyan" variant="solid" htmlType="submit">
                        Care
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
