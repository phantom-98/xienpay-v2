import { payout } from "@/services/ant-design-pro/api";
import PayoutTable from "./components/PayoutTable";

const PayoutList: React.FC = () => {
    return <PayoutTable
        type="progress"
        table={['id','merchant_order_id','merchant','user_id','status','amount','ac_name','uuid','updated_at','option']}
        search={['id','merchant_order_id','merchant','user_id','status','amount','bank_name','uuid']}
        download={true}
        createPayout={true}
        action={true}
        payout={async (req) => {
            return await payout({...req, status: 'initiated'});
        }}
     />
}

export default PayoutList;