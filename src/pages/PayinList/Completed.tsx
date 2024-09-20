import { payin } from "@/services/ant-design-pro/api";
import PayinTable from "./components/PayinTable";

const PayinList: React.FC = () => {

  return (
    <PayinTable
      title="pages.payinTable.completed"
      defaultTitle="Completed"
      table={['id','agent_submitted_amount','commission','status','user_id','merchant','time_taken','utr_id','bank','merchant_order_id','uuid','updated_at']}
      search={['uuid','merchant_order_id','utr_id','time_taken','merchant','user_id','id','short_code','bank']}
      utrImage={true}
      payin={async (req) => {
        return await payin({...req, status: 'success'});
      }}
    />
  );
};

export default PayinList;