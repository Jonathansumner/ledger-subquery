// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type MessageProps = Omit<Message, NonNullable<FunctionPropertyNames<Message>>| '_name'>;

export class Message implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public typeUrl?: string;

    public json?: string;

    public timeline?: bigint;


    get _name(): string {
        return 'Message';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Message entity without an ID");
        await store.set('Message', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Message entity without an ID");
        await store.remove('Message', id.toString());
    }

    static async get(id:string): Promise<Message | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Message entity without an ID");
        const record = await store.get('Message', id.toString());
        if (record){
            return this.create(record as MessageProps);
        }else{
            return;
        }
    }


    static async getByTypeUrl(typeUrl: string): Promise<Message[] | undefined>{
      
      const records = await store.getByField('Message', 'typeUrl', typeUrl);
      return records.map(record => this.create(record as MessageProps));
      
    }

    static async getByTimeline(timeline: bigint): Promise<Message[] | undefined>{
      
      const records = await store.getByField('Message', 'timeline', timeline);
      return records.map(record => this.create(record as MessageProps));
      
    }


    static create(record: MessageProps): Message {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
