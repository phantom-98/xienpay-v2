import { payin } from "@/services/ant-design-pro/api";
import PayinTable from "./components/PayinTable";

const PayinList: React.FC = () => {

  return (
    <PayinTable
      type="drop"
      table={['id','amount','short_code','status','user_id','merchant','bank','merchant_order_id','uuid','updated_at']}
      search={['uuid','merchant_order_id','utr_id','time_taken','merchant','user_id','amount','id','short_code','bank']}
      payin={async (req) => {
        return await payin({...req, status: 'dropped'});
      }}
    />
  );
};

export default PayinList;