import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ServiceRequest extends Document {
  @Prop({ required: true })
  agreementId: number;

  @Prop({ required: true })
  agreementName: string; // Added agreementName here

  @Prop({ required: true })
  taskDescription: string;

  @Prop({ required: true, enum: ['Single', 'Multi', 'Team'] })
  type: string;

  @Prop({ required: true })
  project: string;

  //@Prop({ type: [Number], required: true })
  //selectedDomains: number[];

  @Prop({
    type: [
      {
        domainId: Number,
        domainName: String,
        roleId: Number,
        role: String,
        level: String,
        technologyLevel: String,
        numberOfProfilesNeeded: Number,
      },
    ],
    required: true,
  })
  selectedMembers: {
    domainId: number;
    domainName: string;
    roleId: number;
    role: string;
    level: string;
    technologyLevel: string;
    numberOfProfilesNeeded: number;
  }[];

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

  @Prop()
  numberOfOffers?: number;

  @Prop()
  consumer?: string;

  @Prop({ type: [String], required: true })
  representatives: string[];

  @Prop()
  locationType: string;

  @Prop({ default: 'draft', enum: ['draft', 'submitted', 'assigned', 'published', 'rejected'] })
  status: string;

  @Prop({ default: null })
  providerManagerId: string;

  @Prop({ default: 'Cycle1' })
  cycleStatus: string;

  @Prop({ type: [String], default: [] })
  notifications: string[];

  @Prop()
  document?: string;

  @Prop({ required: true })
  createdBy: string;
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);
