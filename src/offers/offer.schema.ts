import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Offer extends Document {

  @Prop({ required: true })
  serviceRequestId: string;

  @Prop({ type: Number, default: null }) // Allow null for cases with "No Offers"
  providerId: number;

  @Prop({ type: String, default: null }) // Allow null for cases with "No Offers"
  providerName: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  technologyLevel: string;

  @Prop({ type: Number, default: null }) // Allow null for cases with "No Offers"
  price: number;

  @Prop({ required: true })
  cycle: string;

  @Prop({ required: true })
  domainId: number; // Define domainId if it's part of the offer

  @Prop({
    type: [{ 
      employeeID: { type: String, required: true }, 
      employeeName: { type: String, required: true }, // Properly define employeeName
     // price: { type: Number, required: true } 
    }],
    default: [], // Default to an empty array for "No Offers"
  })
  employeeProfiles: {
    employeeID: string;
    employeeName: string; // Now correctly included
   //price: number;
  }[];

  @Prop({
    required: true,
    enum: ['Pending', 'Approved', 'Rejected', 'No Offers','Selected','Revisions Requested'], // Add "No Offers"
    default: 'Pending',
  })
  status: string;

  @Prop({ type: String })
  comments?: string; // Optional field for comments
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

// Add index for faster queries
OfferSchema.index({ serviceRequestId: 1 });