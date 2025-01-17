/* import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ServiceRequest extends Document {
  @Prop({ required: true })
  agreementId: number;

  @Prop({ required: true })
  agreementName: string;

  @Prop({ required: true })
  taskDescription: string;

  @Prop({ required: true, enum: ['Single', 'Multi', 'Team'] })
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

  @Prop({ type: [Number], required: true }) // For multiple domains
  selectedDomains: number[];

  @Prop({
    type: [
      {
        providerId: Number,
        domainId: Number,
        role: String,
        level: String,
        technology: String,
        providerName: String,
        price: String,
      },
    ],
    required: true,
  })
  selectedMembers: {
    providerId: number;
    domainId: number;
    role: string;
    level: string;
    technology: string;
    providerName: string;
    price: String,
  }[];

  @Prop({
    type: Object,
    default: {
      cycle1: { providers: [] },
      cycle2: { providers: [] },
    },
  })
  cycleDetails: {
    cycle1: { providers: { providerId: number; providerName: string; price: string }[] };
    cycle2: { providers: { providerId: number; providerName: string; price: string }[] };
  };

  @Prop({ default: 'draft', enum: ['draft', 'submitted', 'assigned', 'published', 'rejected'] })
  status: string;

  @Prop({ default: null })
  providerManagerId: string;

  @Prop({ type: [String], default: [] })
  notifications: string[];

  @Prop({ required: true }) // Add this field
  createdBy: string; // User ID of the creator
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);
 */
// New Schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ServiceRequest extends Document {
  @Prop({ required: true })
  agreementId: number;

  @Prop({ required: true })
  agreementName: string;

  @Prop({ required: true })
  taskDescription: string;

  @Prop({ required: true, enum: ['Single', 'Multi', 'Team'] })
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

  @Prop({ type: [Number], required: true })
  selectedDomains: number[];

  @Prop({
    type: [
      {
        domainId: Number,
        domainName: String,
        role: String,
        level: String,
        technologyLevel: String,
      },
    ],
    required: true,
  })
  selectedMembers: {
    domainId: number;
    domainName: string;
    role: string;
    level: string;
    technologyLevel: string;
  }[];

  @Prop({ default: 'draft', enum: ['draft', 'submitted', 'assigned', 'published', 'rejected'] })
  status: string;

  @Prop({ default: null })
  providerManagerId: string;

  @Prop({ default: 'cycle_one' })
  cycleStatus: string;

  @Prop({ type: [String], default: [] })
  notifications: string[];

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  informationForProviderManager?: string;

  @Prop()
  numberOfSpecialists: number;

  @Prop()
  numberOfOffers: number;

  @Prop()
  consumer: string;

  @Prop({ type: [String], required: true })
  representatives: string[];

  @Prop()
  locationType: string;

  @Prop()
  document?: string;
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);
