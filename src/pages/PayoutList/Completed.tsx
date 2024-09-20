import { payout } from "@/services/ant-design-pro/api";
import PayoutTable from "./components/PayoutTable";

const PayoutList: React.FC = () => {
    return <PayoutTable
        title="pages.payoutTable.completed"
        defaultTitle="Completed"
        table={['id','merchant_order_id','merchant','user_id','status','time_taken','amount','commission','ac_name','uuid','utr_id','updated_at','option']}
        search={['time_taken','id','merchant_order_id','merchant','user_id','status','bank_name','uuid','utr_id']}
        confirm={true}
        uuid={true}
        payout={async (req) => {
            return await payout({...req, status: 'success'});
        }}
    />
}

export default PayoutList;