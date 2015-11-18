import React from 'react';
import SettingForm from 'routes/Settings/components/SettingForm';
import SettingPageMixin from 'routes/Settings/mixins/SettingPageMixin';

import t from 'utils/tcomb-form';

const Entry = {
	share_hidden: t.Bool,
	share_no_empty_dirs: t.Bool,
	share_no_zero_byte: t.Bool,
	share_follow_symlinks: t.Bool,
	share_report_duplicates: t.Bool,
	share_report_skiplist: t.Bool,
	share_max_size: t.Positive,

	share_skiplist: t.maybe(t.Str),
	share_skiplist_regex: t.Bool,
};

const SharingOptionsPage = React.createClass({
	mixins: [ SettingPageMixin('form') ],
	render() {
		return (
			<div className="sharing-options-settings">
				<SettingForm
					ref="form"
					formItems={Entry}
				/>
			</div>
		);
	}
});

export default SharingOptionsPage;