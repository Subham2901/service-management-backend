import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MasterAgreementDetail extends Document {
  @Prop({ required: true })
  agreementId: number;

  @Prop({ required: true })
  domainId: number;

  @Prop({ required: true })
  domainName: string;

  @Prop({ required: true })
  providerId: number;

  @Prop({ required: true })
  providerName: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  technologyLevel: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true, enum: ['cycle_one', 'cycle_two'] })
  cycle: string;
}

export const MasterAgreementDetailSchema = SchemaFactory.createForClass(MasterAgreementDetail);
