
import {FilteringType, SortingType, getFilteringTypes, getFilteringTypeId} from "./DataTypes";
import {Subscription} from "./Subscription";
import {SubscriptionManager} from "./SubscriptionManager";
import {LocalPersistence} from "./LocalPersistence";

export class SubscriptionDAO {
    private SUBSCRIPTION_ID_PREFIX = "subscription_";
    
    save(subscription: Subscription) { 
        var url = subscription.getURL();
        var id = this.getSubscriptionId(url);
        this.put(id, subscription);
        console.log("Subscription saved: " + JSON.stringify(subscription));
    }

    load(url: string): Subscription {
        var subscription = new Subscription(this, url);
        var subscriptionDTO = LocalPersistence.get(this.getSubscriptionId(url), null);
        if(subscriptionDTO != null) {
            console.log("Loaded saved subscription: " + JSON.stringify(subscriptionDTO));
            subscription.update(subscriptionDTO, true);            
        }
        return subscription;
    }
    
    getAllSubscriptionURLs() : string[] {
        var urls = GM_listValues().filter((value: string) => {
            return value.indexOf(this.SUBSCRIPTION_ID_PREFIX) == 0;
        });
        urls = urls.map<string>((value: string) => {
            return value.substring(this.SUBSCRIPTION_ID_PREFIX.length);
        });
        return urls;
    }
    
    getSubscriptionId(url: string): string {
        return this.SUBSCRIPTION_ID_PREFIX + url;
    }
    
    put(id: string, value: any) {
        LocalPersistence.put(id, value, (key, val) => {
            if(! (val instanceof SubscriptionDAO)) return val;
        });
    }
}