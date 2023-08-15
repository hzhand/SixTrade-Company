sap.ui.define(
[
    "sap/m/MessageBox"
],

function(MessageBox)
{
    "use strict";
    
	return {
		messageToast: function(message)
		{
			let sTargetPos = sap.ui.core.Popup.Dock.CenterCenter; // [COMMENTS] Options: default
			sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
			sap.m.MessageToast.show(message, {
				duration: 2000 || 3000,
				at: sTargetPos,
				my: sTargetPos
			});
        },
        
		uiBusyDuration: function()
		{
			let busyDuration = 100;
			return busyDuration;
        },
        
		uiBusyDelay: function()
		{
			let busyDelay = 10;
			return busyDelay;
        },
        
		doBusy: function(fnResolve, self, args)
		{
			let duration = this.uiBusyDuration();
			let delay = this.uiBusyDelay();
			sap.ui.core.BusyIndicator.show(delay);
			let timeout = setTimeout(function()
			{
				if (typeof fnResolve === "function")
				{
					fnResolve(self, args);
				}
				sap.ui.core.BusyIndicator.hide();
				clearTimeout(timeout);
			}, duration);
        },

        getFormattedDate: function(view, id)
        {
            let dateValue = view.byId(id).getDateValue();
            let dateFormat = view.byId(id).getDisplayFormat();
            let dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({pattern: dateFormat});
            let formattedDate = dateFormatter.format(dateValue);
            return formattedDate;
        },

        setFormattedDate: function(view, id, argFormattedDate)
        {
            if( ! argFormattedDate ) {
                return;
            }

            let dateFormat = view.byId(id).getDisplayFormat();
            let dateValue = new Date(argFormattedDate);
            dateValue = this.toDateTimeZoneOffet(dateValue);
            let dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({pattern: dateFormat});
            let formattedDate = dateFormatter.format(dateValue);
            view.byId(id).setValue(formattedDate);
        },

        toUnixTime: function(dateTimestamp)
        {
            return dateTimestamp / 1000 | 0;
        },

        toDateTimeZoneOffet: function(date)
        {
            let timeEpoch = date.getTime();
            let now = new Date();
            let timeZoneOffset = now.getTimezoneOffset();
            let offsetAdj = timeEpoch + (timeZoneOffset * 60 * 1000);
            return new Date(offsetAdj);
        },

        timeEpochToFormattedDate: function(timeEpoch, dateFormat)
        {
            let dateValue = new Date(timeEpoch);
            let dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({pattern: dateFormat});
            let formattedDate = dateFormatter.format(dateValue);
            return formattedDate;
        },

        addDays: function(argDate, argDays)
        {
            let date = new Date(argDate);
            date.setDate(date.getDate() + argDays);
            return date;
        },

        addDaysFormatted: function(argDate, argDays, dateFormat)
        {
            let date = this.addDays(argDate, argDays)
            return this.timeEpochToFormattedDate(date.getTime(), dateFormat);
        },

        sleep: function(milliseconds)
        {
            let nowTimestamp = Date.now();
            let now;
            do
            {
                now = Date.now();
            }
            while ((now - nowTimestamp) < milliseconds)
        }
	};
});