import { payin } from "@/services/ant-design-pro/api";
import PayinTable from "./components/PayinTable";

const PayinList: React.FC = () => {

  return (
    <PayinTable
      type="progress"
      table={['id','agent_submitted_amount','short_code','status','user_id','merchant','merchant_order_id','bank','uuid','updated_at']}
      search={['uuid','merchant_order_id','utr_id','time_taken','merchant','user_id','id','short_code','bank']}
      createPayin={true}
      payin={async (req) => {
        return await payin({...req, status: 'assigned'});
      }}
    />
  );
};

export default PayinList;