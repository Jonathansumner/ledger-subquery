// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';



import {
    TxStatus,
} from '../enums'


export type TransactionProps = Omit<Transaction, NonNullable<FunctionPropertyNames<Transaction>>| '_name'>;

export class Transaction implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockId?: string;

    public gasUsed?: bigint;

    public gasWanted?: bigint;

    public memo?: string;

    public status?: TxStatus;

    public log?: string;

    public timeline?: bigint;

    public timeoutHeight?: bigint;

    public signerAddress?: string;


    get _name(): string {
        return 'Transaction';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Transaction entity without an ID");
        await store.set('Transaction', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Transaction entity without an ID");
        await store.remove('Transaction', id.toString());
    }

    static async get(id:string): Promise<Transaction | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Transaction entity without an ID");
        const record = await store.get('Transaction', id.toString());
        if (record){
            return this.create(record as TransactionProps);
        }else{
            return;
        }
    }


    static async getByBlockId(blockId: string): Promise<Transaction[] | undefined>{
      
      const records = await store.getByField('Transaction', 'blockId', blockId);
      return records.map(record => this.create(record as TransactionProps));
      
    }

    static async getByTimeline(timeline: bigint): Promise<Transaction[] | undefined>{
      
      const records = await store.getByField('Transaction', 'timeline', timeline);
      return records.map(record => this.create(record as TransactionProps));
      
    }

    static async getByTimeoutHeight(timeoutHeight: bigint): Promise<Transaction[] | undefined>{
      
      const records = await store.getByField('Transaction', 'timeoutHeight', timeoutHeight);
      return records.map(record => this.create(record as TransactionProps));
      
    }

    static async getBySignerAddress(signerAddress: string): Promise<Transaction[] | undefined>{
      
      const records = await store.getByField('Transaction', 'signerAddress', signerAddress);
      return records.map(record => this.create(record as TransactionProps));
      
    }


    static create(record: TransactionProps): Transaction {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
