// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';

import {
    Coin,
} from '../interfaces'




export type TransferProps = Omit<Transfer, NonNullable<FunctionPropertyNames<Transfer>>| '_name'>;

export class Transfer implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public toAddress?: string;

    public fromAddress?: string;

    public amounts?: Coin[];

    public denom?: string;

    public timeline?: bigint;


    get _name(): string {
        return 'Transfer';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Transfer entity without an ID");
        await store.set('Transfer', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Transfer entity without an ID");
        await store.remove('Transfer', id.toString());
    }

    static async get(id:string): Promise<Transfer | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Transfer entity without an ID");
        const record = await store.get('Transfer', id.toString());
        if (record){
            return this.create(record as TransferProps);
        }else{
            return;
        }
    }


    static async getByToAddress(toAddress: string): Promise<Transfer[] | undefined>{
      
      const records = await store.getByField('Transfer', 'toAddress', toAddress);
      return records.map(record => this.create(record as TransferProps));
      
    }

    static async getByFromAddress(fromAddress: string): Promise<Transfer[] | undefined>{
      
      const records = await store.getByField('Transfer', 'fromAddress', fromAddress);
      return records.map(record => this.create(record as TransferProps));
      
    }

    static async getByDenom(denom: string): Promise<Transfer[] | undefined>{
      
      const records = await store.getByField('Transfer', 'denom', denom);
      return records.map(record => this.create(record as TransferProps));
      
    }

    static async getByTimeline(timeline: bigint): Promise<Transfer[] | undefined>{
      
      const records = await store.getByField('Transfer', 'timeline', timeline);
      return records.map(record => this.create(record as TransferProps));
      
    }


    static create(record: TransferProps): Transfer {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
