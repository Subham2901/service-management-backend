import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  serviceRequestId: string;

  @Prop({ required: true })
  agreementId: number;

  @Prop({ required: true })
  agreementName: string;

  @Prop({ required: true })
  taskDescription: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  project: string;

  @Prop({ required: true })
  begin: Date;

  @Prop({ required: true })
  end: Date;

  @Prop({ required: true })
  amountOfManDays: number;

  @Prop({ required: true })
  location: string;

  @Prop()
  informationForProviderManager?: string;

  @Prop()
  numberOfSpecialists: number;

  @Prop({ required: true })
  consumer: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({
    type: [
      {
        domainId: Number,
        domainName: String,
        role: String,
        level: String,
        technologyLevel: String,
        providerId: Number,
        providerName: String,
        price: Number,
        cycle: String,
        employeeProfiles: [
          {
            employeeID: String,
            employeeName: String,
          },
        ],
      },
    ],
    required: true,
  })
  approvedOffers: {
    domainId: number;
    domainName: string;
    role: string;
    level: string;
    technologyLevel: string;
    providerId: number;
    providerName: string;
    price: number;
    cycle: string;
    employeeProfiles: { employeeID: string; employeeName: string }[];
  }[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true, default: 'OrderCreated' })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
