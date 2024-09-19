import { payout } from "@/services/ant-design-pro/api";
import PayoutTable from "./components/PayoutTable";

const PayoutList: React.FC = () => {
    return <PayoutTable
        type="all"
        table={['id','merchant_order_id','merchant','user_id','status','amount','ac_name','utr_id','uuid','updated_at','option']}
        search={['id','merchant_order_id','merchant','user_id','status','amount','account_holder_name','account_number','bank_name','utr_id','uuid']}
        createPayout={true}
        action={true}
        confirm={true}
        payout={async (req) => {
            return await payout(req);
        }}
    />
}

export default PayoutList;