import { payin } from "@/services/ant-design-pro/api";
import PayinTable from "./components/PayinTable";

const PayinList: React.FC = () => {

  return (
    <PayinTable
      title="pages.payinTable.title"
      defaultTitle="Payins List"
      table={['id','short_code','agent_submitted_amount','merchant_order_id','merchant','user_id','bank','status','time_taken','uuid','amount','agent','utr_id','user_submitted_utr','updated_at']}
      search={['id','short_code','merchant_order_id','merchant','user_id','bank','status','time_taken','uuid','amount','agent','utr_id']}
      createPayin={true}
      utrImage={true}
      payin={async (req) => {
        return await payin(req);
      }}
    />
  );
};

export default PayinList;