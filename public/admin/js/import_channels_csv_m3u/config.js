
export default function (nga, admin) {
    var import_channels = admin.getEntity('import_channel');

    import_channels.creationView()
        .title('<h4>Live TV <i class="fa fa-angle-right" aria-hidden="true"></i> Import Channels in CSV , M3U</h4>')
        .fields([
            nga.field('filename','file')
                .uploadInformation({ 'url': '/file-upload/single-file/temp/filename', 'accept': 'image/*, .csv, text/xml, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'apifilename': 'result', multiple: false})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.filename"></ma-file-field></div>'+
                    '<div class="col-xs-12 col-sm-1" style="display: none;"><img src="{{ entry.values.filename }}"/></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">Expected file types: csv , m3u</small></div>')
                .label('File input *'),
            nga.field('template')
                .label('')
                .template('<importchannel_logs post="entry"></importchannel_logs>')
        ]);

    return import_channels;

}